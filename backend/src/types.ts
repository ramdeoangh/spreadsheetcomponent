// UserEvent schema - input from the text box
export interface UserEvent {
  id: string;
  timestamp: Date;
  message: string;
  userId?: string;
  sessionId?: string;
}

// ActionEvent schema - updates the Spreadsheet Terminal State
export interface ActionEvent {
  id: string;
  timestamp: Date;
  action: 'UPDATE_CELL' | 'INSERT_ROW' | 'DELETE_ROW' | 'INSERT_COLUMN' | 'DELETE_COLUMN' | 'FORMAT_CELL' | 'HEADER_RENAME' | 'ERROR' | 'GENERAL_MESSAGE';
  target: {
    row?: number;
    col?: number;
    cellId?: string;
  };
  data?: any;
  message: string;
}

// StateEvent schema - updates the Spreadsheet State
export interface StateEvent {
  id: string;
  timestamp: Date;
  type: 'CELL_UPDATE' | 'ROW_INSERT' | 'ROW_DELETE' | 'COLUMN_INSERT' | 'COLUMN_DELETE' | 'FORMAT_CHANGE' | 'HEADER_RENAME' | 'ERROR' | 'GENERAL_MESSAGE';
  cellData?: {
    row: number;
    col: number;
    value: string;
    formula?: string;
    format?: {
      bold?: boolean;
      italic?: boolean;
      color?: string;
      backgroundColor?: string;
    };
  };
  rowData?: {
    rowIndex: number;
    cells: Array<{
      col: number;
      value: string;
      formula?: string;
    }>;
  };
  columnData?: {
    colIndex: number;
    header: string;
  };
}

// Spreadsheet Cell interface
export interface SpreadsheetCell {
  row: number;
  col: number;
  value: string;
  formula?: string;
  format?: {
    bold?: boolean;
    italic?: boolean;
    color?: string;
    backgroundColor?: string;
  };
}

// Spreadsheet State interface
export interface SpreadsheetState {
  cells: SpreadsheetCell[];
  rows: number;
  columns: number;
  headers: string[];
} 