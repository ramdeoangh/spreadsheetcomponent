# Generic Components Documentation

## Overview

This directory contains two fully generic and reusable components:
- **Spreadsheet**: A configurable spreadsheet component with selection, editing, and scrolling capabilities
- **InputBox**: A flexible input component with command examples and selection integration

Both components are completely self-contained with isolated CSS and can be used in any React project without conflicts.

## Spreadsheet Component

### Location
```
frontend/src/components/Spreadsheet/
├── index.tsx      # Main component
└── styles.css     # Scoped styles
```

### Props Interface
```typescript
interface SpreadsheetProps {
  data: SpreadsheetState;                    // Required: Spreadsheet data
  isLoading?: boolean;                       // Optional: Loading state
  config?: Partial<SpreadsheetConfig>;      // Optional: Configuration override
  onCellUpdate?: (row: number, col: number, value: string) => void;
  onSelectionChange?: (selectedCells: string[], selectedColumns: string[], selectedRows: number[]) => void;
  className?: string;                        // Optional: Additional CSS classes
}
```

### Configuration
```typescript
interface SpreadsheetConfig {
  INITIAL_VISIBLE_ROWS: number;    // Default: 20
  MAX_VISIBLE_ROWS: number;        // Default: 100
  SCROLL_EXPANSION_ROWS: number;   // Default: 20
  SCROLL_THRESHOLD: number;        // Default: 0.8
  CELL_WIDTH: number;              // Default: 120
  CELL_HEIGHT: number;             // Default: 30
  HEADER_HEIGHT: number;           // Default: 40
  ROW_HEADER_WIDTH: number;        // Default: 60
}
```

### Data Structure
```typescript
interface SpreadsheetState {
  rows: number;
  columns: number;
  headers: string[];
  cells: SpreadsheetCell[];
}

interface SpreadsheetCell {
  row: number;
  col: number;
  value: string;
  format?: React.CSSProperties;
}
```

### Usage Example
```tsx
import Spreadsheet from './components/Spreadsheet';

const MyComponent = () => {
  const [data, setData] = useState<SpreadsheetState>({
    rows: 50,
    columns: 10,
    headers: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    cells: []
  });

  const handleCellUpdate = (row: number, col: number, value: string) => {
    // Handle cell updates
    console.log(`Cell ${row},${col} = ${value}`);
  };

  const handleSelectionChange = (cells: string[], columns: string[], rows: number[]) => {
    // Handle selection changes
    console.log('Selected:', { cells, columns, rows });
  };

  return (
    <Spreadsheet
      data={data}
      isLoading={false}
      config={{
        INITIAL_VISIBLE_ROWS: 15,
        MAX_VISIBLE_ROWS: 200,
        CELL_WIDTH: 100
      }}
      onCellUpdate={handleCellUpdate}
      onSelectionChange={handleSelectionChange}
      className="my-spreadsheet"
    />
  );
};
```

### Features
- ✅ **Cell Selection**: Click to select individual cells
- ✅ **Column Selection**: Click headers to select entire columns
- ✅ **Row Selection**: Click row numbers to select entire rows
- ✅ **Inline Editing**: Double-click cells to edit
- ✅ **Virtual Scrolling**: Efficient rendering of large datasets
- ✅ **Configurable**: All dimensions and behaviors customizable
- ✅ **CSS Isolated**: No style conflicts with other components

## InputBox Component

### Location
```
frontend/src/components/InputBox/
├── index.tsx      # Main component
└── styles.css     # Scoped styles
```

### Props Interface
```typescript
interface InputBoxProps {
  onMessageSent: (message: string) => void;  // Required: Message handler
  onError?: (error: string) => void;         // Optional: Error handler
  isProcessing?: boolean;                     // Optional: Processing state
  selectedCells?: string[];                  // Optional: Selected cells
  selectedColumns?: string[];                // Optional: Selected columns
  selectedRows?: number[];                   // Optional: Selected rows
  placeholder?: string;                      // Optional: Input placeholder
  className?: string;                        // Optional: Additional CSS classes
  disabled?: boolean;                        // Optional: Disable input
  showSelectionInfo?: boolean;               // Optional: Show selection info
  showCommandExamples?: boolean;             // Optional: Show command examples
}
```

### Usage Example
```tsx
import InputBox from './components/InputBox';

const MyComponent = () => {
  const [selectedCells, setSelectedCells] = useState<string[]>(['A1', 'B2']);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMessageSent = async (message: string) => {
    setIsProcessing(true);
    try {
      // Send message to backend
      await sendToBackend(message);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (error: string) => {
    console.error('InputBox error:', error);
  };

  return (
    <InputBox
      onMessageSent={handleMessageSent}
      onError={handleError}
      isProcessing={isProcessing}
      selectedCells={selectedCells}
      selectedColumns={['A', 'B']}
      selectedRows={[1, 2]}
      placeholder="Enter your command..."
      showSelectionInfo={true}
      showCommandExamples={true}
      className="my-input-box"
    />
  );
};
```

### Features
- ✅ **Smart Placeholder**: Dynamic placeholder based on selection
- ✅ **Selection Integration**: Automatically formats commands for selected cells/columns/rows
- ✅ **Interactive Examples**: Clickable command examples
- ✅ **Error Handling**: Built-in error display and handling
- ✅ **Processing State**: Loading spinner during operations
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **CSS Isolated**: No style conflicts with other components

## CSS Isolation

Both components use **scoped CSS** to prevent conflicts:

### Spreadsheet CSS Scoping
- All styles are prefixed with `.spreadsheet-container`
- Animation names are unique (`spreadsheet-spin`)
- No global style pollution

### InputBox CSS Scoping
- All styles are prefixed with `.input-box-container`
- Animation names are unique (`inputbox-spin`)
- No global style pollution

## Integration Example

Here's how to use both components together:

```tsx
import React, { useState } from 'react';
import Spreadsheet from './components/Spreadsheet';
import InputBox from './components/InputBox';

const SpreadsheetApp = () => {
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetState>({
    rows: 30,
    columns: 8,
    headers: ['Name', 'Age', 'City', 'Email', 'Phone', 'Department', 'Salary', 'Status'],
    cells: []
  });

  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleCellUpdate = (row: number, col: number, value: string) => {
    // Update spreadsheet data
    const newCells = [...spreadsheetData.cells];
    const existingIndex = newCells.findIndex(c => c.row === row && c.col === col);
    
    if (existingIndex >= 0) {
      newCells[existingIndex] = { ...newCells[existingIndex], value };
    } else {
      newCells.push({ row, col, value });
    }
    
    setSpreadsheetData({ ...spreadsheetData, cells: newCells });
  };

  const handleSelectionChange = (cells: string[], columns: string[], rows: number[]) => {
    setSelectedCells(cells);
    setSelectedColumns(columns);
    setSelectedRows(rows);
  };

  const handleMessageSent = async (message: string) => {
    // Process the message and update spreadsheet
    console.log('Processing message:', message);
    // Your message processing logic here
  };

  return (
    <div className="app-container">
      <Spreadsheet
        data={spreadsheetData}
        onCellUpdate={handleCellUpdate}
        onSelectionChange={handleSelectionChange}
        config={{
          INITIAL_VISIBLE_ROWS: 20,
          MAX_VISIBLE_ROWS: 100
        }}
      />
      
      <InputBox
        onMessageSent={handleMessageSent}
        selectedCells={selectedCells}
        selectedColumns={selectedColumns}
        selectedRows={selectedRows}
        showSelectionInfo={true}
        showCommandExamples={true}
      />
    </div>
  );
};

export default SpreadsheetApp;
```

## Best Practices

1. **Always provide required props**: `data` for Spreadsheet, `onMessageSent` for InputBox
2. **Use TypeScript**: Both components are fully typed
3. **Handle errors**: Implement `onError` callbacks
4. **Customize configuration**: Override defaults as needed
5. **Test thoroughly**: Components are designed to be robust

## Migration Guide

If you're migrating from the old components:

1. **Update imports**:
   ```tsx
   // Old
   import Spreadsheet from './Spreadsheet';
   import InputBox from './InputBox';
   
   // New
   import Spreadsheet from './Spreadsheet';
   import InputBox from './InputBox';
   ```

2. **Update props** (if any custom props were used)
3. **Test functionality**: All features should work identically
4. **Remove old files**: Delete the old component files

## Troubleshooting

### Common Issues

1. **Styles not applying**: Ensure CSS files are imported
2. **Type errors**: Check that all required props are provided
3. **Selection not working**: Verify `onSelectionChange` callback is implemented
4. **Updates not reflecting**: Check that `onCellUpdate` is properly updating state

### Debug Tips

- Use browser dev tools to inspect component structure
- Check console for any error messages
- Verify that all required data structures are correct
- Test with minimal configuration first

---

**Both components are production-ready and can be safely used in any React project!** 🚀 