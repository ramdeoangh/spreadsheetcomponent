import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InputBox from './index';

describe('InputBox Component', () => {
  const mockOnMessageSent = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<InputBox onMessageSent={mockOnMessageSent} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays default placeholder', () => {
    render(<InputBox onMessageSent={mockOnMessageSent} />);
    expect(screen.getByPlaceholderText(/Enter command/)).toBeInTheDocument();
  });

  it('displays custom placeholder', () => {
    const customPlaceholder = 'Custom placeholder text';
    render(
      <InputBox 
        onMessageSent={mockOnMessageSent} 
        placeholder={customPlaceholder}
      />
    );
    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
  });

  it('shows selection info when provided', () => {
    const selectedCells = ['A1', 'B2'];
    render(
      <InputBox 
        onMessageSent={mockOnMessageSent}
        selectedCells={selectedCells}
        showSelectionInfo={true}
      />
    );
    expect(screen.getByText(/Cells: A1, B2/)).toBeInTheDocument();
  });

  it('shows command examples when enabled', () => {
    render(
      <InputBox 
        onMessageSent={mockOnMessageSent}
        showCommandExamples={true}
      />
    );
    expect(screen.getByText('🚀 Quick Commands')).toBeInTheDocument();
  });

  it('calls onMessageSent when form is submitted', async () => {
    render(<InputBox onMessageSent={mockOnMessageSent} />);
    
    const input = screen.getByRole('textbox');
    const sendButton = screen.getByText('Send');
    
    fireEvent.change(input, { target: { value: 'A1 Hello World' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockOnMessageSent).toHaveBeenCalledWith('A1 Hello World');
    });
  });

  it('calls onMessageSent when Enter is pressed', async () => {
    render(<InputBox onMessageSent={mockOnMessageSent} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'B2 Test Value' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnMessageSent).toHaveBeenCalledWith('B2 Test Value');
    });
  });

  it('shows error when submitting empty message', () => {
    render(
      <InputBox 
        onMessageSent={mockOnMessageSent}
        onError={mockOnError}
      />
    );
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);

    expect(screen.getByText('Please enter a message')).toBeInTheDocument();
    expect(mockOnError).toHaveBeenCalledWith('Please enter a message');
  });

  it('disables input when disabled prop is true', () => {
    render(
      <InputBox 
        onMessageSent={mockOnMessageSent}
        disabled={true}
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('shows loading spinner when processing', () => {
    render(
      <InputBox 
        onMessageSent={mockOnMessageSent}
        isProcessing={true}
      />
    );
    
    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeDisabled();
    expect(sendButton.querySelector('.loading-spinner')).toBeInTheDocument();
  });

  it('formats commands for selected cells', async () => {
    const selectedCells = ['A1', 'C3'];
    render(
      <InputBox 
        onMessageSent={mockOnMessageSent}
        selectedCells={selectedCells}
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Value' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnMessageSent).toHaveBeenCalledWith('A1 New Value C3 New Value');
    });
  });

  it('formats commands for selected columns', async () => {
    const selectedColumns = ['A', 'B'];
    render(
      <InputBox 
        onMessageSent={mockOnMessageSent}
        selectedColumns={selectedColumns}
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Column Data' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnMessageSent).toHaveBeenCalledWith('A1-100 Column Data B1-100 Column Data');
    });
  });

  it('formats commands for selected rows', async () => {
    const selectedRows = [1, 3];
    render(
      <InputBox 
        onMessageSent={mockOnMessageSent}
        selectedRows={selectedRows}
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Row Data' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnMessageSent).toHaveBeenCalledWith('A1-Z1 Row Data A3-Z3 Row Data');
    });
  });

  it('handles example clicks', () => {
    render(
      <InputBox 
        onMessageSent={mockOnMessageSent}
        showCommandExamples={true}
      />
    );
    
    const exampleButton = screen.getByText('A1 Hello World');
    fireEvent.click(exampleButton);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('A1 Hello World');
  });

  it('clears input after successful submission', async () => {
    render(<InputBox onMessageSent={mockOnMessageSent} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Test Message' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <InputBox 
        onMessageSent={mockOnMessageSent}
        className="custom-input-box"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-input-box');
  });

  it('updates placeholder based on selection', () => {
    const selectedCells = ['A1', 'B2'];
    render(
      <InputBox 
        onMessageSent={mockOnMessageSent}
        selectedCells={selectedCells}
        showSelectionInfo={true}
      />
    );
    
    expect(screen.getByPlaceholderText(/Enter value for selected cells/)).toBeInTheDocument();
  });

  it('handles errors gracefully', async () => {
    const mockOnMessageSentWithError = vi.fn().mockRejectedValue(new Error('Network error'));
    
    render(
      <InputBox 
        onMessageSent={mockOnMessageSentWithError}
        onError={mockOnError}
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith('Network error');
    });
  });
}); 