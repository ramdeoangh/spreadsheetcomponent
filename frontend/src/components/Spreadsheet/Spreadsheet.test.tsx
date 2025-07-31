import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import Spreadsheet from './index';
import type { SpreadsheetState } from '../../types';

// Mock data for testing
const mockSpreadsheetData: SpreadsheetState = {
  rows: 10,
  columns: 5,
  headers: ['A', 'B', 'C', 'D', 'E'],
  cells: [
    { row: 0, col: 0, value: 'Test Cell A1' },
    { row: 1, col: 1, value: 'Test Cell B2' },
    { row: 2, col: 2, value: 'Test Cell C3' }
  ]
};

describe('Spreadsheet Component', () => {
  it('renders without crashing', () => {
    render(<Spreadsheet data={mockSpreadsheetData} />);
    expect(screen.getByText('Spreadsheet')).toBeInTheDocument();
  });

  it('displays the correct number of rows and columns', () => {
    render(<Spreadsheet data={mockSpreadsheetData} />);
    expect(screen.getByText('Showing 10 of 10 rows')).toBeInTheDocument();
  });

  it('renders headers correctly', () => {
    render(<Spreadsheet data={mockSpreadsheetData} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('displays cell values correctly', () => {
    render(<Spreadsheet data={mockSpreadsheetData} />);
    expect(screen.getByText('Test Cell A1')).toBeInTheDocument();
    expect(screen.getByText('Test Cell B2')).toBeInTheDocument();
    expect(screen.getByText('Test Cell C3')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<Spreadsheet data={mockSpreadsheetData} isLoading={true} />);
    expect(screen.getByText('Loading spreadsheet...')).toBeInTheDocument();
  });

  it('calls onCellUpdate when cell is double-clicked', async () => {
    const mockOnCellUpdate = vi.fn();
    render(
      <Spreadsheet 
        data={mockSpreadsheetData} 
        onCellUpdate={mockOnCellUpdate}
      />
    );

    // Find and double-click a cell
    const cell = screen.getByText('Test Cell A1');
    fireEvent.doubleClick(cell);

    // Should show an input field
    const input = screen.getByDisplayValue('Test Cell A1');
    expect(input).toBeInTheDocument();

    // Change the value and press Enter
    fireEvent.change(input, { target: { value: 'Updated Value' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnCellUpdate).toHaveBeenCalledWith(0, 0, 'Updated Value');
    });
  });

  it('calls onSelectionChange when cell is clicked', () => {
    const mockOnSelectionChange = vi.fn();
    render(
      <Spreadsheet 
        data={mockSpreadsheetData} 
        onSelectionChange={mockOnSelectionChange}
      />
    );

    // Click on a cell
    const cell = screen.getByText('Test Cell A1');
    fireEvent.click(cell);

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['A1'], [], []);
  });

  it('calls onSelectionChange when column header is clicked', () => {
    const mockOnSelectionChange = vi.fn();
    render(
      <Spreadsheet 
        data={mockSpreadsheetData} 
        onSelectionChange={mockOnSelectionChange}
      />
    );

    // Click on a column header
    const header = screen.getByText('A');
    fireEvent.click(header);

    expect(mockOnSelectionChange).toHaveBeenCalledWith([], ['A'], []);
  });

  it('calls onSelectionChange when row header is clicked', () => {
    const mockOnSelectionChange = vi.fn();
    render(
      <Spreadsheet 
        data={mockSpreadsheetData} 
        onSelectionChange={mockOnSelectionChange}
      />
    );

    // Click on a row header (row 1)
    const rowHeader = screen.getByText('1');
    fireEvent.click(rowHeader);

    expect(mockOnSelectionChange).toHaveBeenCalledWith([], [], [1]);
  });

  it('applies custom className', () => {
    const { container } = render(
      <Spreadsheet 
        data={mockSpreadsheetData} 
        className="custom-spreadsheet"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-spreadsheet');
  });

  it('uses custom configuration', () => {
    const customConfig = {
      INITIAL_VISIBLE_ROWS: 5,
      CELL_WIDTH: 150,
      CELL_HEIGHT: 40
    };

    render(
      <Spreadsheet 
        data={mockSpreadsheetData} 
        config={customConfig}
      />
    );

    // The component should render with custom config
    expect(screen.getByText('Showing 5 of 10 rows')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const emptyData: SpreadsheetState = {
      rows: 0,
      columns: 0,
      headers: [],
      cells: []
    };

    render(<Spreadsheet data={emptyData} />);
    expect(screen.getByText('Showing 0 of 0 rows')).toBeInTheDocument();
  });

  it('cancels editing when Escape is pressed', async () => {
    const mockOnCellUpdate = vi.fn();
    render(
      <Spreadsheet 
        data={mockSpreadsheetData} 
        onCellUpdate={mockOnCellUpdate}
      />
    );

    // Double-click to start editing
    const cell = screen.getByText('Test Cell A1');
    fireEvent.doubleClick(cell);

    // Press Escape
    const input = screen.getByDisplayValue('Test Cell A1');
    fireEvent.keyDown(input, { key: 'Escape' });

    // Should not call onCellUpdate
    expect(mockOnCellUpdate).not.toHaveBeenCalled();
  });
}); 