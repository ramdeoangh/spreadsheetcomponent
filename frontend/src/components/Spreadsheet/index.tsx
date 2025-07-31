import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { SpreadsheetState } from '../../types';
import './styles.css';

// Default configuration that can be overridden
export interface SpreadsheetConfig {
  INITIAL_VISIBLE_ROWS: number;
  MAX_VISIBLE_ROWS: number;
  SCROLL_EXPANSION_ROWS: number;
  SCROLL_THRESHOLD: number;
  CELL_WIDTH: number;
  CELL_HEIGHT: number;
  HEADER_HEIGHT: number;
  ROW_HEADER_WIDTH: number;
}

const DEFAULT_CONFIG: SpreadsheetConfig = {
  INITIAL_VISIBLE_ROWS: 20,
  MAX_VISIBLE_ROWS: 100,
  SCROLL_EXPANSION_ROWS: 20,
  SCROLL_THRESHOLD: 0.8,
  CELL_WIDTH: 120,
  CELL_HEIGHT: 30,
  HEADER_HEIGHT: 40,
  ROW_HEADER_WIDTH: 60,
};

export interface SpreadsheetProps {
  data: SpreadsheetState;
  isLoading?: boolean;
  config?: Partial<SpreadsheetConfig>;
  onCellUpdate?: (row: number, col: number, value: string) => void;
  onSelectionChange?: (selectedCells: string[], selectedColumns: string[], selectedRows: number[]) => void;
  className?: string;
}

const Spreadsheet: React.FC<SpreadsheetProps> = ({ 
  data, 
  isLoading = false,
  config = {},
  onCellUpdate,
  onSelectionChange,
  className = ''
}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [visibleRows, setVisibleRows] = useState(finalConfig.INITIAL_VISIBLE_ROWS);
  const [isExpanding, setIsExpanding] = useState(false);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const spreadsheetRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const editInputRef = useRef<HTMLInputElement>(null);

  // Reset visible rows when data changes
  useEffect(() => {
    setVisibleRows(finalConfig.INITIAL_VISIBLE_ROWS);
  }, [data.rows, finalConfig.INITIAL_VISIBLE_ROWS]);

  const handleScroll = useCallback(() => {
    if (!spreadsheetRef.current || isExpanding) return;

    const { scrollTop, scrollHeight, clientHeight } = spreadsheetRef.current;
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);

    if (scrollPercentage >= finalConfig.SCROLL_THRESHOLD && 
        visibleRows < Math.min(data.rows, finalConfig.MAX_VISIBLE_ROWS)) {
      
      setIsExpanding(true);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Add more rows after a short delay
      scrollTimeoutRef.current = setTimeout(() => {
        const newVisibleRows = Math.min(
          visibleRows + finalConfig.SCROLL_EXPANSION_ROWS,
          Math.min(data.rows, finalConfig.MAX_VISIBLE_ROWS)
        );
        setVisibleRows(newVisibleRows);
        setIsExpanding(false);
      }, 300);
    }
  }, [visibleRows, data.rows, isExpanding, finalConfig]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Convert column index to letter
  const columnIndexToLetter = (index: number): string => {
    let result = '';
    while (index >= 0) {
      result = String.fromCharCode(65 + (index % 26)) + result;
      index = Math.floor(index / 26) - 1;
    }
    return result;
  };

  const handleCellClick = useCallback((row: number, col: number) => {
    const cellId = `${columnIndexToLetter(col)}${row + 1}`;
    setSelectedCells([cellId]);
    setSelectedColumns([]);
    setSelectedRows([]);
    onSelectionChange?.([cellId], [], []);
  }, [onSelectionChange]);

  const handleColumnHeaderClick = useCallback((col: number) => {
    const columnLetter = columnIndexToLetter(col);
    setSelectedColumns([columnLetter]);
    setSelectedCells([]);
    setSelectedRows([]);
    onSelectionChange?.([], [columnLetter], []);
  }, [onSelectionChange]);

  const handleRowHeaderClick = useCallback((row: number) => {
    setSelectedRows([row + 1]);
    setSelectedCells([]);
    setSelectedColumns([]);
    onSelectionChange?.([], [], [row + 1]);
  }, [onSelectionChange]);

  const handleCellDoubleClick = useCallback((row: number, col: number) => {
    const cell = data.cells.find(c => c.row === row && c.col === col);
    setEditingCell({ row, col });
    setEditValue(cell?.value || '');
  }, [data.cells]);

  const handleEditComplete = useCallback(() => {
    if (editingCell && onCellUpdate) {
      // Pass the actual row index (0-based) to match the data structure
      onCellUpdate(editingCell.row, editingCell.col, editValue);
    }
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, onCellUpdate]);

  const handleEditCancel = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditComplete();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  }, [handleEditComplete, handleEditCancel]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  const isCellSelected = useCallback((row: number, col: number) => {
    const cellId = `${columnIndexToLetter(col)}${row + 1}`;
    return selectedCells.includes(cellId);
  }, [selectedCells]);

  const isColumnSelected = useCallback((col: number) => {
    const columnLetter = columnIndexToLetter(col);
    return selectedColumns.includes(columnLetter);
  }, [selectedColumns]);

  const isRowSelected = useCallback((row: number) => {
    return selectedRows.includes(row + 1);
  }, [selectedRows]);

  if (isLoading) {
    return (
      <div className={`spreadsheet-container ${className}`}>
        <div className="spreadsheet-loading">
          <div className="loading-spinner"></div>
          <p>Loading spreadsheet...</p>
        </div>
      </div>
    );
  }

  const totalRows = data.rows;
  const totalColumns = data.columns;
  const displayRows = Math.min(visibleRows, totalRows);

  return (
    <div className={`spreadsheet-container ${className}`}>
      <div className="spreadsheet-header">
        <h3>Spreadsheet</h3>
        <div className="row-counter">
          Showing {displayRows} of {totalRows} rows
          {isExpanding && <span className="expanding-indicator"> (Expanding...)</span>}
        </div>
      </div>
      
      <div 
        className="spreadsheet-wrapper"
        ref={spreadsheetRef}
        onScroll={handleScroll}
        style={{
          maxHeight: `${finalConfig.CELL_HEIGHT * finalConfig.INITIAL_VISIBLE_ROWS + finalConfig.HEADER_HEIGHT}px`,
          overflow: 'auto'
        }}
      >
        <div 
          className="spreadsheet"
          style={{
            width: `${totalColumns * finalConfig.CELL_WIDTH + finalConfig.ROW_HEADER_WIDTH}px`,
            height: `${totalRows * finalConfig.CELL_HEIGHT + finalConfig.HEADER_HEIGHT}px`
          }}
        >
          {/* Column Headers */}
          <div className="spreadsheet-headers">
            <div className="corner-cell"></div>
            {data.headers.map((header, index) => (
              <div 
                key={index} 
                className={`header-cell ${isColumnSelected(index) ? 'selected' : ''}`}
                style={{ width: finalConfig.CELL_WIDTH }}
                onClick={() => handleColumnHeaderClick(index)}
              >
                {header}
              </div>
            ))}
          </div>

          {/* Row Headers and Data */}
          <div className="spreadsheet-body">
            {Array.from({ length: totalRows }, (_, rowIndex) => (
              <div key={rowIndex} className="spreadsheet-row">
                <div 
                  className={`row-header ${isRowSelected(rowIndex) ? 'selected' : ''}`}
                  style={{ height: finalConfig.CELL_HEIGHT }}
                  onClick={() => handleRowHeaderClick(rowIndex)}
                >
                  {rowIndex + 1}
                </div>
                {data.headers.map((_, colIndex) => {
                  const cell = data.cells.find(
                    c => c.row === rowIndex && c.col === colIndex
                  );
                  const isSelected = isCellSelected(rowIndex, colIndex);
                  const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                  
                  return (
                    <div
                      key={colIndex}
                      className={`cell ${isSelected ? 'selected' : ''}`}
                      style={{
                        width: finalConfig.CELL_WIDTH,
                        height: finalConfig.CELL_HEIGHT,
                        ...cell?.format
                      }}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                    >
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleEditComplete}
                          onKeyDown={handleEditKeyDown}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontSize: '14px'
                          }}
                        />
                      ) : (
                        cell?.value || ''
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet; 