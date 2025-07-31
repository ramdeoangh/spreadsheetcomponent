import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

export interface InputBoxProps {
  onMessageSent: (message: string) => void;
  onError?: (error: string) => void;
  isProcessing?: boolean;
  selectedCells?: string[];
  selectedColumns?: string[];
  selectedRows?: number[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showSelectionInfo?: boolean;
  showCommandExamples?: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({
  onMessageSent,
  onError,
  isProcessing = false,
  selectedCells = [],
  selectedColumns = [],
  selectedRows = [],
  placeholder = "Enter command (e.g., A1 value, A1-C5 value, A1-100 value)...",
  className = '',
  disabled = false,
  showSelectionInfo = true,
  showCommandExamples = true
}) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clear message when selection changes
  useEffect(() => {
    setMessage('');
  }, [selectedCells, selectedColumns, selectedRows]);

  useEffect(() => {
    // Auto-focus input when component mounts
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      onError?.('Please enter a message');
      return;
    }

    if (isProcessing) {
      return;
    }

    try {
      setError(null);
      
      // Handle different selection types
      let commandToSend = message.trim();
      
      if (selectedCells.length > 0) {
        // Fill selected cells with the value
        const cellCommands = selectedCells.map(cell => `${cell} ${message.trim()}`);
        commandToSend = cellCommands.join(' ');
      } else if (selectedColumns.length > 0) {
        // Fill entire columns with the value (A1-100, B1-100, etc.)
        const columnCommands = selectedColumns.map(col => `${col}1-${col}100 ${message.trim()}`);
        commandToSend = columnCommands.join(' ');
      } else if (selectedRows.length > 0) {
        // Fill entire rows with the value (A1-Z1, A2-Z2, etc.)
        const rowCommands = selectedRows.map(row => `A${row}-Z${row} ${message.trim()}`);
        commandToSend = rowCommands.join(' ');
      }
      
      await onMessageSent(commandToSend);
      setMessage('');
      
      // Refocus input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getPlaceholder = () => {
    if (selectedCells.length > 0) {
      return `Enter value for selected cells: ${selectedCells.join(', ')}`;
    }
    if (selectedColumns.length > 0) {
      return `Enter value to fill column(s): ${selectedColumns.join(', ')}`;
    }
    if (selectedRows.length > 0) {
      return `Enter value to fill row(s): ${selectedRows.join(', ')}`;
    }
    return placeholder;
  };

  const getSelectionText = () => {
    const parts = [];
    
    if (selectedCells.length > 0) {
      parts.push(`Cells: ${selectedCells.join(', ')}`);
    }
    
    if (selectedColumns.length > 0) {
      parts.push(`Columns: ${selectedColumns.join(', ')}`);
    }
    
    if (selectedRows.length > 0) {
      parts.push(`Rows: ${selectedRows.join(', ')}`);
    }
    
    return parts.length > 0 ? parts.join(' | ') : 'No selection';
  };

  const getCommandExamples = () => {
    if (selectedCells.length > 0) {
      return [
        { command: 'Hello World', type: 'cell-command' },
        { command: '42', type: 'cell-command' },
        { command: 'Sample Data', type: 'cell-command' },
        { command: 'Updated Value', type: 'cell-command' }
      ];
    }
    if (selectedColumns.length > 0) {
      return [
        { command: 'Column Data', type: 'range-command' },
        { command: '100', type: 'range-command' },
        { command: 'Fill Column', type: 'range-command' },
        { command: 'Default Value', type: 'range-command' }
      ];
    }
    if (selectedRows.length > 0) {
      return [
        { command: 'Row Data', type: 'range-command' },
        { command: '200', type: 'range-command' },
        { command: 'Fill Row', type: 'range-command' },
        { command: 'Default Value', type: 'range-command' }
      ];
    }
    return [
      { command: 'A1 Hello World', type: 'cell-command' },
      { command: 'B5 42', type: 'cell-command' },
      { command: 'A1-C5 Fill Range', type: 'range-command' },
      { command: 'A1-100 Fill Column', type: 'range-command' },
      { command: 'A1-Z1 Fill Row', type: 'range-command' },
      { command: 'change column A to Name', type: 'header-command' },
      { command: 'change column B to Age', type: 'header-command' },
      { command: 'change column C header name to Department', type: 'header-command' }
    ];
  };

  const handleExampleClick = (command: string) => {
    setMessage(command);
    setError(null);
    // Focus the input after setting the message
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  return (
    <div className={`input-box-container ${className}`}>
      {showSelectionInfo && (
        <div className="selection-info">
          <span className="selection-label">Selection:</span>
          <span className="selection-text">{getSelectionText()}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={disabled || isProcessing}
            className={`message-input ${error ? 'error' : ''}`}
          />
          <button
            type="submit"
            disabled={disabled || isProcessing || !message.trim()}
            className="send-button"
          >
            {isProcessing ? (
              <div className="loading-spinner small"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </form>

      {showCommandExamples && (
        <div className="command-examples">
          <h4>🚀 Quick Commands</h4>
          <div className="examples-grid">
            {getCommandExamples().map((example, index) => (
              <div 
                key={index} 
                className={`example-item ${example.type}`}
                onClick={() => handleExampleClick(example.command)}
                title={`Click to use: ${example.command}`}
              >
                <code>{example.command}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputBox; 