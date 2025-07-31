// Command parser utility for spreadsheet commands
export interface ParsedCommand {
  type: 'CELL_UPDATE' | 'INVALID';
  cellRef?: string;
  row?: number;
  col?: number;
  value?: string;
  error?: string;
}

export const parseCommand = (input: string): ParsedCommand => {
  const trimmed = input.trim();
  
  // Pattern: A1 value or A1=value
  const cellPattern = /^([A-Z]+)(\d+)\s*(?:=\s*)?(.+)$/i;
  const match = trimmed.match(cellPattern);
  
  if (match) {
    const [, colStr, rowStr, value] = match;
    const col = parseColumn(colStr);
    const row = parseInt(rowStr) - 1; // Convert to 0-based index
    
    if (col === -1) {
      return {
        type: 'INVALID',
        error: `Invalid column reference: ${colStr}`
      };
    }
    
    if (isNaN(row) || row < 0) {
      return {
        type: 'INVALID',
        error: `Invalid row number: ${rowStr}`
      };
    }
    
    return {
      type: 'CELL_UPDATE',
      cellRef: `${colStr}${rowStr}`,
      row,
      col,
      value: value.trim()
    };
  }
  
  // If no cell pattern, treat as general message
  return {
    type: 'CELL_UPDATE',
    row: 0,
    col: 0,
    value: trimmed
  };
};

const parseColumn = (colStr: string): number => {
  const upper = colStr.toUpperCase();
  let result = 0;
  
  for (let i = 0; i < upper.length; i++) {
    const char = upper.charCodeAt(i) - 64; // A=1, B=2, etc.
    if (char < 1 || char > 26) return -1;
    result = result * 26 + char;
  }
  
  // Limit to reasonable column range (A-ZZ)
  if (result > 702) return -1; // ZZ = 26*26 + 26 = 702
  
  return result - 1; // Convert to 0-based index
};

export const formatCellRef = (row: number, col: number): string => {
  const colStr = numberToColumn(col);
  const rowStr = (row + 1).toString();
  return `${colStr}${rowStr}`;
};

const numberToColumn = (num: number): string => {
  let result = '';
  while (num >= 0) {
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26) - 1;
  }
  return result;
}; 