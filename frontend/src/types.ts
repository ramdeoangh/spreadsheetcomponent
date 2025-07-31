// Backend API types
export interface UserEvent {
  id: string;
  timestamp: Date;
  message: string;
  userId?: string;
  sessionId?: string;
}

export interface ActionEvent {
  id: string;
  timestamp: Date;
  action: 'UPDATE_CELL' | 'INSERT_ROW' | 'DELETE_ROW' | 'INSERT_COLUMN' | 'DELETE_COLUMN' | 'FORMAT_CELL' | 'HEADER_RENAME';
  target: {
    row?: number;
    col?: number;
    cellId?: string;
  };
  data?: any;
  message: string;
}

export interface StateEvent {
  id: string;
  timestamp: Date;
  type: 'CELL_UPDATE' | 'ROW_INSERT' | 'ROW_DELETE' | 'COLUMN_INSERT' | 'COLUMN_DELETE' | 'FORMAT_CHANGE' | 'HEADER_RENAME';
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

export interface SpreadsheetState {
  cells: SpreadsheetCell[];
  rows: number;
  columns: number;
  headers: string[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface ActionResponse {
  success: boolean;
  actions: ActionEvent[];
  count: number;
}

export interface StateResponse {
  success: boolean;
  state: SpreadsheetState;
  stateEvents: StateEvent[];
  count: number;
} 