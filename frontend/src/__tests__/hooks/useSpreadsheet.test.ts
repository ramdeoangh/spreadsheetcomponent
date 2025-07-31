import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSpreadsheet } from '../../hooks/useSpreadsheet';

vi.mock('../../services/api', () => {
  const mockApiService = {
    getState: vi.fn(),
  };

  return {
    apiService: mockApiService,
  };
});

// Import the mocked apiService to access the mocks
import { apiService } from '../../services/api';

describe('useSpreadsheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSpreadsheetState = {
    cells: [
      { row: 0, col: 0, value: 'Hello', format: { bold: false, italic: false } },
      { row: 1, col: 1, value: 'World', format: { bold: true, italic: false } },
    ],
    headers: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    rows: 10,
    columns: 10,
  };

  it('should initialize with default state', async () => {
    (apiService.getState as any).mockResolvedValue({
      success: true,
      state: mockSpreadsheetState
    });

    const { result } = renderHook(() => useSpreadsheet());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.spreadsheetState).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('should load spreadsheet state on mount', async () => {
    (apiService.getState as any).mockResolvedValue({
      success: true,
      state: mockSpreadsheetState
    });

    const { result } = renderHook(() => useSpreadsheet());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiService.getState).toHaveBeenCalledTimes(1);
    expect(result.current.spreadsheetState).toEqual(mockSpreadsheetState);
  });

  it('should handle loading state', async () => {
    (apiService.getState as any).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useSpreadsheet());

    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', async () => {
    const mockError = new Error('Failed to load state');
    (apiService.getState as any).mockRejectedValue(mockError);

    const { result } = renderHook(() => useSpreadsheet());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load state');
  });

  it('should provide getCellValue function', async () => {
    (apiService.getState as any).mockResolvedValue({
      success: true,
      state: mockSpreadsheetState
    });

    const { result } = renderHook(() => useSpreadsheet());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getCellValue(0, 0)).toBe('Hello'); // A1
    expect(result.current.getCellValue(1, 1)).toBe('World'); // B2
    expect(result.current.getCellValue(5, 5)).toBe(''); // Empty cell
  });

  it('should provide getCellFormat function', async () => {
    (apiService.getState as any).mockResolvedValue({
      success: true,
      state: mockSpreadsheetState
    });

    const { result } = renderHook(() => useSpreadsheet());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getCellFormat(0, 0)).toEqual({ bold: false, italic: false });
    expect(result.current.getCellFormat(1, 1)).toEqual({ bold: true, italic: false });
    expect(result.current.getCellFormat(5, 5)).toEqual({ bold: false, italic: false, color: '#000000', backgroundColor: '#ffffff' });
  });

  it('should provide loadSpreadsheetState function', async () => {
    (apiService.getState as any).mockResolvedValue({
      success: true,
      state: mockSpreadsheetState
    });

    const { result } = renderHook(() => useSpreadsheet());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear the mock to verify it's called again
    (apiService.getState as any).mockClear();

    await result.current.loadSpreadsheetState();

    expect(apiService.getState).toHaveBeenCalledTimes(1);
  });
}); 