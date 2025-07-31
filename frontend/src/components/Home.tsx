import React, { useState, useEffect, useCallback, useRef } from 'react';
import Spreadsheet from './Spreadsheet';
import InputBox from './InputBox';
import { useSpreadsheet } from '../hooks/useSpreadsheet';
import { useWebSocket } from '../hooks/useWebSocket';
import { useIdleDetection } from '../hooks/useIdleDetection';
import { apiService } from '../services/api';
import { IDLE_CONFIG } from '../utils/constants';
import './Home.css';

// Home component using generic Spreadsheet and InputBox components
const Home: React.FC = () => {
  const { loadSpreadsheetState, spreadsheetState, loading, error, isInitialized } = useSpreadsheet();
  const [inputError, setInputError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  
  // Debounce refs to prevent excessive API calls
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTime = useRef(0);

  // Idle detection
  const { isIdle, forceActive } = useIdleDetection({
    idleTime: IDLE_CONFIG.IDLE_TIME,
    events: IDLE_CONFIG.EVENTS,
    onIdle: () => {
      console.log('User is now idle - pausing WebSocket updates');
    },
    onActive: () => {
      console.log('User is active again - resuming WebSocket updates');
      // Refresh data when user becomes active
      loadSpreadsheetState(false);
    }
  });

  // Debounced update function
  const debouncedUpdate = useCallback((updateFunction: () => void, delay: number = IDLE_CONFIG.DEBOUNCE_DELAY) => {
    const now = Date.now();
    if (now - lastUpdateTime.current < delay) {
      // Clear existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Set new timeout
      updateTimeoutRef.current = setTimeout(() => {
        updateFunction();
        lastUpdateTime.current = Date.now();
      }, delay);
    } else {
      // Execute immediately if enough time has passed
      updateFunction();
      lastUpdateTime.current = now;
    }
  }, []);

  // WebSocket for real-time updates
  const handleSpreadsheetUpdate = (data: any) => {
    console.log('WebSocket spreadsheet update received:', data);
    debouncedUpdate(() => {
      console.log('Refreshing spreadsheet state...');
      loadSpreadsheetState(false);
    });
  };

  const handleActionEventsUpdate = (data: any) => {
    console.log('WebSocket action events update received:', data);
  };

  const handleStateEventsUpdate = (data: any) => {
    console.log('WebSocket state events update received:', data);
    debouncedUpdate(() => {
      loadSpreadsheetState(false);
    });
  };

  const handleWebSocketConnect = () => {
    console.log('WebSocket Connected - Loading initial data...');
    loadSpreadsheetState(false);
  };

  const handleWebSocketDisconnect = () => {
    console.log('WebSocket Disconnected');
  };

  const { isConnected, connectionError, sendMessage } = useWebSocket(
    handleSpreadsheetUpdate,
    handleActionEventsUpdate,
    handleStateEventsUpdate,
    handleWebSocketConnect,
    handleWebSocketDisconnect,
    isIdle // Pass idle state to WebSocket hook
  );

  // Test WebSocket connection
  const testWebSocket = () => {
    console.log('Testing WebSocket connection...');
    console.log('Current connection state:', isConnected);
    console.log('Connection error:', connectionError);
    console.log('User idle state:', isIdle);
    sendMessage('test');
  };

  // Debug effect to track component lifecycle
  useEffect(() => {
    console.log('Home component mounted');
    return () => {
      console.log('Home component unmounted');
      // Cleanup timeout on unmount
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectionChange = (cells: string[], columns: string[], rows: number[]) => {
    setSelectedCells(cells);
    setSelectedColumns(columns);
    setSelectedRows(rows);
    console.log('Selection changed:', { cells, columns, rows });
    // Force active when user interacts with spreadsheet
    forceActive();
  };

  const handleMessageSent = async (message: string) => {
    console.log('Message sent from InputBox:', message);
    setInputError(null);
    setIsProcessing(true);
    // Force active when user sends a message
    forceActive();

    try {
      // Send message to backend (WebSocket will handle the updates)
      await apiService.sendMessage(message);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      setInputError('Failed to send message');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (errorMessage: string) => {
    setInputError(errorMessage);
  };

  const handleCellUpdate = async (row: number, col: number, value: string) => {
    console.log(`Cell update: ${row},${col} = ${value}`);
    
    // Convert row and col to cell reference (e.g., A1, B2, etc.)
    // row is 0-based from Spreadsheet component, convert to 1-based for backend
    const columnLetter = String.fromCharCode(65 + col); // A=0, B=1, etc.
    const cellReference = `${columnLetter}${row + 1}`; // Convert 0-based to 1-based
    const message = `${cellReference} ${value}`;
    
    try {
      // Send the cell update to the backend
      await apiService.sendMessage(message);
      console.log(`Cell update sent: ${message}`);
    } catch (error) {
      console.error('Error updating cell:', error);
      setInputError('Failed to update cell');
    }
  };

  const handleRetry = () => {
    console.log('Retrying spreadsheet load...');
    loadSpreadsheetState(true);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Spreadsheet Application</h1>
        <p>Interactive spreadsheet with real-time updates and user input</p>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 WebSocket Connected' : '🔴 Disconnected'}
          </span>
          {isIdle && (
            <span className="idle-indicator">⏸️ Idle Mode</span>
          )}
          {connectionError && (
            <span className="connection-error">Error: {connectionError}</span>
          )}
          <button onClick={testWebSocket} className="test-button">
            Test WebSocket
          </button>
        </div>
      </div>

      <div className="main-section">
        <Spreadsheet
          data={spreadsheetState}
          isLoading={loading && !isInitialized}
          onCellUpdate={handleCellUpdate}
          onSelectionChange={handleSelectionChange}
          config={{
            INITIAL_VISIBLE_ROWS: 20,
            MAX_VISIBLE_ROWS: 100,
            SCROLL_EXPANSION_ROWS: 20,
            SCROLL_THRESHOLD: 0.8
          }}
        />
        
        <InputBox
          onMessageSent={handleMessageSent}
          onError={handleError}
          isProcessing={isProcessing}
          selectedCells={selectedCells}
          selectedColumns={selectedColumns}
          selectedRows={selectedRows}
          placeholder="Enter command (e.g., A1 value, A1-C5 value, A1-100 value)..."
          showSelectionInfo={true}
          showCommandExamples={true}
        />
      </div>
    </div>
  );
};

export default Home; 