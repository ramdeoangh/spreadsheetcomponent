// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000, // 10 seconds
} as const;

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  URL: import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3001',
  TIMEOUT: 10000,
  RECONNECTION_ATTEMPTS: 3,
} as const;

// Spreadsheet Configuration
export const SPREADSHEET_CONFIG = {
  DEFAULT_ROWS: 30, // Backend starts with 30 rows
  DEFAULT_COLUMNS: 26,
  MAX_ROWS: 1000,
  MAX_COLUMNS: 100,
  CELL_WIDTH: 120,
  CELL_HEIGHT: 30,
  HEADER_HEIGHT: 40,
  ROW_HEADER_WIDTH: 60,
  INITIAL_VISIBLE_ROWS: 20, // Frontend shows 20 rows initially
  MAX_VISIBLE_ROWS: 100,    // Frontend can show up to 100 rows
  SCROLL_EXPANSION_ROWS: 20, // Add 20 rows at a time
  SCROLL_THRESHOLD: 0.8,    // 80% scroll to trigger expansion
};

export const IDLE_CONFIG = {
  IDLE_TIME: 30000, // 30 seconds
  EVENTS: ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'],
  DEBOUNCE_DELAY: 300, // 300ms for WebSocket updates
  REQUEST_THROTTLE: 1000, // 1 second between API requests
};

// UI Configuration
export const UI_CONFIG = {
  REFRESH_INTERVAL: 2000, // 2 seconds
  ERROR_DISPLAY_DURATION: 5000, // 5 seconds
  ANIMATION_DURATION: 300, // 300ms
} as const;

// Command Examples
export const COMMAND_EXAMPLES = [
  'A1 Hello World',
  'B5 = 42',
  'C3 Test Message',
  'Z50 = SUM(A1:A10)',
  'AA1 = 100',
  'A1-100 42', // Fill column A with 42
  'A1-Z1 Test', // Fill row 1 with Test
];

// Cell Format Defaults
export const DEFAULT_CELL_FORMAT = {
  bold: false,
  italic: false,
  color: '#000000',
  backgroundColor: '#ffffff',
} as const;

// Generate column headers dynamically
export const generateColumnHeaders = (count: number): string[] => {
  const headers: string[] = [];
  for (let i = 0; i < count; i++) {
    headers.push(columnIndexToLetter(i));
  }
  return headers;
};

// Convert column index to letter (0=A, 1=B, 25=Z, 26=AA, etc.)
export const columnIndexToLetter = (index: number): string => {
  let result = '';
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result;
    index = Math.floor(index / 26) - 1;
  }
  return result;
};

// Convert letter to column index (A=0, B=1, Z=25, AA=26, etc.)
export const letterToColumnIndex = (letter: string): number => {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 64);
  }
  return result - 1;
}; 