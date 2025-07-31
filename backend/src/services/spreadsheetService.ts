import { UserEvent, ActionEvent, StateEvent, SpreadsheetState, SpreadsheetCell } from '../types';
import { CustomError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { websocketService } from './websocketService';

// Constants
const MAX_ROWS = 100;
const INITIAL_ROWS = 100; // Start with 100 rows to show scrolling

// Types for command parsing
interface ParsedCommand {
  type: 'SINGLE' | 'RANGE' | 'HEADER_RENAME';
  cell?: string;
  col?: number;
  row?: number;
  startCell?: string;
  endCell?: string;
  startCol?: number;
  startRow?: number;
  endCol?: number;
  endRow?: number;
  value: string;
  originalCommand: string;
}

// Helper function to generate column headers
const generateColumnHeaders = (count: number): string[] => {
  const headers: string[] = [];
  for (let i = 0; i < count; i++) {
    headers.push(columnIndexToLetter(i));
  }
  return headers;
};

// Convert column index to letter (0=A, 1=B, 25=Z, 26=AA, etc.)
const columnIndexToLetter = (index: number): string => {
  let result = '';
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result;
    index = Math.floor(index / 26) - 1;
  }
  return result;
};

// Convert letter to column index (A=0, B=1, Z=25, AA=26, etc.)
const letterToColumnIndex = (letter: string): number => {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 64);
  }
  return result - 1; // Convert to 0-based index
};

// In-memory storage (replace with database in production)
class SpreadsheetDataStore {
  private userEvents: UserEvent[] = [];
  private actionEvents: ActionEvent[] = [];
  private stateEvents: StateEvent[] = [];
  private spreadsheetState: SpreadsheetState = {
    cells: [],
    rows: INITIAL_ROWS, // Start with 30 rows for virtual scrolling
    columns: 26, // A-Z columns
    headers: generateColumnHeaders(26) // Generate A-Z headers
  };

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Add some initial cells with more variety - create data for 100 rows
    for (let row = 0; row < 100; row++) {
      for (let col = 0; col < 10; col++) {
        this.spreadsheetState.cells.push({
          row,
          col,
          value: `Row ${row + 1} Col ${columnIndexToLetter(col)}`,
          format: {
            bold: false,
            italic: false,
            color: '#000000',
            backgroundColor: '#ffffff'
          }
        });
      }
    }

    // Add some mock action events
    this.actionEvents.push({
      id: '1',
      timestamp: new Date(),
      action: 'UPDATE_CELL',
      target: { row: 0, col: 0 },
      data: { value: 'Sample Data' },
      message: 'Updated cell A1'
    });

    // Add some mock state events
    this.stateEvents.push({
      id: '1',
      timestamp: new Date(),
      type: 'CELL_UPDATE',
      cellData: {
        row: 0,
        col: 0,
        value: 'Sample Data'
      }
    });

    logger.info('Mock data initialized with 100 rows for scrolling demonstration');
  }

  // Command parser utility
  private parseCommand(message: string): ParsedCommand {
    const trimmedMessage = message.trim();
    const parts = trimmedMessage.split(/\s+/);
    
    if (parts.length < 2) {
      throw new CustomError('Invalid command format. Use: <cell> <value> or <range> <value>', 400);
    }

    // Check for column header rename command
    // Supports both formats:
    // - "change column A to Name"
    // - "change column A header name to Age"
    const renameMatch = trimmedMessage.match(/^change\s+column\s+([A-Z]+)\s+(?:header\s+name\s+)?to\s+(.+)$/i);
    if (renameMatch) {
      const columnLetter = renameMatch[1].toUpperCase();
      const newName = renameMatch[2].trim();
      const colIndex = letterToColumnIndex(columnLetter);
      
      if (colIndex < 0 || colIndex >= this.spreadsheetState.columns) {
        throw new CustomError(`Invalid column: ${columnLetter}`, 400);
      }

      return {
        type: 'HEADER_RENAME',
        col: colIndex,
        value: newName,
        originalCommand: trimmedMessage
      };
    }

    const cellOrRange = parts[0].toUpperCase();
    const value = parts.slice(1).join(' ');

    // Check for range format (e.g., A1-100, A1-Z1)
    const rangeMatch = cellOrRange.match(/^([A-Z]+)(\d+)-([A-Z]*\d+)$/);
    if (rangeMatch) {
      const [, startCol, startRow, endCell] = rangeMatch;
      const startCell = `${startCol}${startRow}`;
      
      // Parse end cell
      const endMatch = endCell.match(/^([A-Z]*)(\d+)$/);
      if (!endMatch) {
        throw new CustomError('Invalid range format', 400);
      }
      
      const [, endCol, endRow] = endMatch;
      const startColIndex = letterToColumnIndex(startCol);
      const startRowIndex = parseInt(startRow);
      const endColIndex = endCol ? letterToColumnIndex(endCol) : startColIndex;
      const endRowIndex = parseInt(endRow);

      return {
        type: 'RANGE',
        startCell,
        endCell,
        startCol: startColIndex,
        startRow: startRowIndex,
        endCol: endColIndex,
        endRow: endRowIndex,
        value,
        originalCommand: trimmedMessage
      };
    }

    // Check for single cell format (e.g., A1)
    const cellMatch = cellOrRange.match(/^([A-Z]+)(\d+)$/);
    if (!cellMatch) {
      throw new CustomError('Invalid cell format. Use: A1, B5, etc.', 400);
    }

    const [, column, row] = cellMatch;
    const colIndex = letterToColumnIndex(column);
    const rowIndex = parseInt(row);

    if (rowIndex < 1) {
      throw new CustomError('Row number must be at least 1', 400);
    }

    return {
      type: 'SINGLE',
      cell: cellOrRange,
      col: colIndex,
      row: rowIndex,
      value,
      originalCommand: trimmedMessage
    };
  }

  private parseColumn(colStr: string): number {
    const upperCol = colStr.toUpperCase();
    let result = 0;
    
    for (let i = 0; i < upperCol.length; i++) {
      const charCode = upperCol.charCodeAt(i);
      if (charCode < 65 || charCode > 90) { // A-Z range
        return -1;
      }
      result = result * 26 + (charCode - 64);
    }
    
    // Check if column is within reasonable limits (A-ZZ)
    if (result > 702) { // ZZ = 26*26 + 26 = 702
      return -1;
    }
    
    return result - 1; // Convert to 0-based index
  }

  async processUserMessage(message: string, userId?: string, sessionId?: string): Promise<{
    userEvent: UserEvent;
    actionEvent: ActionEvent;
    stateEvent: StateEvent;
    parsedCommand: ParsedCommand;
  }> {
    try {
      const timestamp = new Date();
      const userEvent: UserEvent = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message,
        timestamp,
        userId: userId || 'anonymous',
        sessionId: sessionId || 'default'
      };

      this.userEvents.push(userEvent);

      const parsedCommand = this.parseCommand(message);
      let actionEvent: ActionEvent;
      let stateEvent: StateEvent;

      if (parsedCommand.type === 'SINGLE' && parsedCommand.row !== undefined && parsedCommand.col !== undefined) {
        // Handle single cell update
        // Convert 1-based row to 0-based for data structure
        const rowIndex = parsedCommand.row - 1;
        const newRows = Math.min(Math.max(this.spreadsheetState.rows, parsedCommand.row), MAX_ROWS); // Cap at 100 rows
        const newColumns = Math.max(this.spreadsheetState.columns, parsedCommand.col + 1);
        
        if (newRows > this.spreadsheetState.rows) {
          this.spreadsheetState.rows = newRows;
          logger.info(`Auto-expanded rows to ${newRows}`);
        }
        
        if (newColumns > this.spreadsheetState.columns) {
          this.spreadsheetState.columns = newColumns;
          this.spreadsheetState.headers = generateColumnHeaders(newColumns);
          logger.info(`Auto-expanded columns to ${newColumns} (${this.spreadsheetState.headers[newColumns - 1]})`);
        }

        // Update cell in spreadsheet
        const existingCellIndex = this.spreadsheetState.cells.findIndex(
          cell => cell.row === rowIndex && cell.col === parsedCommand.col
        );

        const cellData: SpreadsheetCell = {
          row: rowIndex,
          col: parsedCommand.col,
          value: parsedCommand.value,
          format: {
            bold: false,
            italic: false,
            color: '#000000',
            backgroundColor: '#ffffff'
          }
        };

        if (existingCellIndex >= 0) {
          this.spreadsheetState.cells[existingCellIndex] = cellData;
        } else {
          this.spreadsheetState.cells.push(cellData);
        }

        // Create action event
        actionEvent = {
          id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          action: 'UPDATE_CELL',
          target: { row: rowIndex, col: parsedCommand.col },
          data: { value: parsedCommand.value },
          message: `Updated cell ${parsedCommand.cell}`
        };

        // Create state event
        stateEvent = {
          id: `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          type: 'CELL_UPDATE',
          cellData: {
            row: rowIndex,
            col: parsedCommand.col,
            value: parsedCommand.value
          }
        };

        logger.info(`Cell updated: ${parsedCommand.cell} = "${parsedCommand.value}"`);

      } else if (parsedCommand.type === 'RANGE') {
        // Handle range update (fill multiple cells)
        const cellsUpdated: SpreadsheetCell[] = [];
        
        for (let row = parsedCommand.startRow!; row <= parsedCommand.endRow!; row++) {
          for (let col = parsedCommand.startCol!; col <= parsedCommand.endCol!; col++) {
            // Auto-expand if needed
            const newRows = Math.min(Math.max(this.spreadsheetState.rows, row), MAX_ROWS); // Cap at 100 rows
            const newColumns = Math.max(this.spreadsheetState.columns, col + 1);
            
            if (newRows > this.spreadsheetState.rows) {
              this.spreadsheetState.rows = newRows;
            }
            
            if (newColumns > this.spreadsheetState.columns) {
              this.spreadsheetState.columns = newColumns;
              this.spreadsheetState.headers = generateColumnHeaders(newColumns);
            }

            // Convert 1-based row to 0-based for data structure
            const rowIndex = row - 1;

            // Update or add cell
            const existingCellIndex = this.spreadsheetState.cells.findIndex(
              cell => cell.row === rowIndex && cell.col === col
            );

            const cellData: SpreadsheetCell = {
              row: rowIndex,
              col,
              value: parsedCommand.value,
              format: {
                bold: false,
                italic: false,
                color: '#000000',
                backgroundColor: '#ffffff'
              }
            };

            if (existingCellIndex >= 0) {
              this.spreadsheetState.cells[existingCellIndex] = cellData;
            } else {
              this.spreadsheetState.cells.push(cellData);
            }

            cellsUpdated.push(cellData);
          }
        }

        // Create action event
        actionEvent = {
          id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          action: 'UPDATE_CELL',
          target: { row: parsedCommand.startRow!, col: parsedCommand.startCol! },
          data: { 
            value: parsedCommand.value,
            range: `${parsedCommand.startCell}-${parsedCommand.endCell}`,
            cellsUpdated: cellsUpdated.length
          },
          message: `Updated range ${parsedCommand.startCell}-${parsedCommand.endCell} with "${parsedCommand.value}" (${cellsUpdated.length} cells)`
        };

        // Create state event
        stateEvent = {
          id: `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          type: 'CELL_UPDATE',
          cellData: {
            row: parsedCommand.startRow!,
            col: parsedCommand.startCol!,
            value: parsedCommand.value
          }
        };

        logger.info(`Range updated: ${parsedCommand.startCell}-${parsedCommand.endCell} = "${parsedCommand.value}" (${cellsUpdated.length} cells)`);

      } else if (parsedCommand.type === 'HEADER_RENAME') {
        // Handle column header rename
        const colIndex = parsedCommand.col!;
        const newName = parsedCommand.value;

        if (colIndex < 0 || colIndex >= this.spreadsheetState.columns) {
          throw new CustomError(`Invalid column index for header rename: ${colIndex}`, 400);
        }

        const oldHeader = this.spreadsheetState.headers[colIndex];
        this.spreadsheetState.headers[colIndex] = newName;

        actionEvent = {
          id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          action: 'HEADER_RENAME',
          target: { row: -1, col: colIndex },
          data: {
            oldHeader: oldHeader,
            newHeader: newName
          },
          message: `Header renamed from "${oldHeader}" to "${newName}"`
        };

        stateEvent = {
          id: `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          type: 'HEADER_RENAME',
          cellData: {
            row: -1,
            col: colIndex,
            value: newName
          }
        };

        logger.info(`Header renamed: ${oldHeader} -> ${newName}`);

      } else {
        // Handle general message
        actionEvent = {
          id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          action: 'GENERAL_MESSAGE',
          target: { row: -1, col: -1 },
          data: { message: parsedCommand.value },
          message: `Message: ${parsedCommand.value}`
        };

        stateEvent = {
          id: `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          type: 'CELL_UPDATE',
          cellData: {
            row: -1,
            col: -1,
            value: parsedCommand.value
          }
        };

        logger.info(`General message processed: "${parsedCommand.value}"`);
      }

      this.actionEvents.push(actionEvent);
      this.stateEvents.push(stateEvent);

      // Broadcast updates via WebSocket
      if (websocketService.isInitialized()) {
        websocketService.broadcastSpreadsheetUpdate(userEvent, actionEvent, stateEvent);
        websocketService.broadcastActionEventsUpdate(this.actionEvents);
        websocketService.broadcastStateEventsUpdate(this.stateEvents);
      }

      return { userEvent, actionEvent, stateEvent, parsedCommand };
    } catch (error) {
      logger.error('Error processing user message:', error);
      throw new CustomError('Failed to process user message', 500);
    }
  }

  async getActionEvents(): Promise<ActionEvent[]> {
    return [...this.actionEvents].reverse(); // Return most recent first
  }

  async getSpreadsheetState(): Promise<SpreadsheetState> {
    const state = { ...this.spreadsheetState };
    logger.info(`Returning spreadsheet state with ${state.cells.length} cells, ${state.rows} rows, ${state.columns} columns`);
    logger.debug('Spreadsheet state:', JSON.stringify(state, null, 2));
    return state;
  }

  async getStateEvents(): Promise<StateEvent[]> {
    const events = [...this.stateEvents].reverse(); // Return most recent first
    logger.info(`Returning ${events.length} state events`);
    return events;
  }

  async getHealthStatus(): Promise<{ status: string; timestamp: Date; endpoints: string[]; dataCounts: any; websocket?: any }> {
    const websocketStats = websocketService.isInitialized() ? websocketService.getConnectionStats() : null;
    
    return {
      status: 'OK',
      timestamp: new Date(),
      endpoints: ['POST /message', 'GET /action', 'GET /state', 'GET /health'],
      dataCounts: {
        userEvents: this.userEvents.length,
        actionEvents: this.actionEvents.length,
        stateEvents: this.stateEvents.length,
        cells: this.spreadsheetState.cells.length
      },
      websocket: websocketStats
    };
  }
}

const spreadsheetService = new SpreadsheetDataStore();
export default spreadsheetService; 