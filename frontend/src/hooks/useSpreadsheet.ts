import { useState, useEffect, useCallback, useRef } from 'react';
import type { SpreadsheetState, StateEvent } from '../types';
import { apiService } from '../services/api';

export const useSpreadsheet = () => {
  const [spreadsheetState, setSpreadsheetState] = useState<SpreadsheetState>({
    cells: [],
    rows: 10,
    columns: 10,
    headers: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isInitialLoad = useRef(true);
  const lastRequestTime = useRef(0);
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadSpreadsheetState = useCallback(async (showLoading = false) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    
    // Throttle requests to prevent rate limiting (minimum 1 second between requests)
    if (timeSinceLastRequest < 1000) {
      console.log('Request throttled, skipping...');
      return;
    }

    console.log('Loading spreadsheet state...', { showLoading, isInitialLoad: isInitialLoad.current });
    
    // Clear any existing timeout
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }
    
    // Only show loading on initial load or when explicitly requested
    if (showLoading || isInitialLoad.current) {
      setLoading(true);
    }
    
    setError(null);
    lastRequestTime.current = now;
    
    try {
      const response = await apiService.getState();
      console.log('API Response:', response);
      
      if (response.success) {
        console.log('Setting spreadsheet state:', response.state);
        setSpreadsheetState(response.state);
        setIsInitialized(true);
      } else {
        console.error('API returned success: false');
        setError('Failed to load spreadsheet state');
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load spreadsheet state';
      
      // Handle rate limiting specifically
      if (err?.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
        // Retry after 5 seconds
        requestTimeoutRef.current = setTimeout(() => {
          console.log('Retrying after rate limit...');
          loadSpreadsheetState(showLoading);
        }, 5000);
      } else {
        setError(errorMessage);
        console.error('Error loading spreadsheet state:', err);
      }
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, []);

  const getCellValue = useCallback((row: number, col: number): string => {
    const cell = spreadsheetState.cells.find(c => c.row === row && c.col === col);
    return cell?.value || '';
  }, [spreadsheetState.cells]);

  const getCellFormat = useCallback((row: number, col: number) => {
    const cell = spreadsheetState.cells.find(c => c.row === row && c.col === col);
    return cell?.format || {
      bold: false,
      italic: false,
      color: '#000000',
      backgroundColor: '#ffffff'
    };
  }, [spreadsheetState.cells]);

  // Initial load
  useEffect(() => {
    loadSpreadsheetState(true);
  }, [loadSpreadsheetState]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, []);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('Spreadsheet state updated:', spreadsheetState);
  }, [spreadsheetState]);

  return {
    spreadsheetState,
    loading,
    error,
    loadSpreadsheetState,
    getCellValue,
    getCellFormat,
    isInitialized,
  };
}; 