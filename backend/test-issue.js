// Test to see what's happening with command parsing
const testCommands = [
  "A1 Hello World",
  "B5 42", 
  "change column A to Name",
  "change column B header name to Age"
];

const parseCommand = (message) => {
  const trimmedMessage = message.trim();
  const parts = trimmedMessage.split(/\s+/);
  
  if (parts.length < 2) {
    return { error: 'Invalid command format' };
  }

  // Check for column header rename command
  const renameMatch = trimmedMessage.match(/^change\s+column\s+([A-Z]+)\s+(?:header\s+name\s+)?to\s+(.+)$/i);
  if (renameMatch) {
    const columnLetter = renameMatch[1].toUpperCase();
    const newName = renameMatch[2].trim();
    return {
      type: 'HEADER_RENAME',
      columnLetter,
      newName,
      originalCommand: trimmedMessage
    };
  }

  const cellOrRange = parts[0].toUpperCase();
  const value = parts.slice(1).join(' ');

  // Check for single cell format (e.g., A1)
  const cellMatch = cellOrRange.match(/^([A-Z]+)(\d+)$/);
  if (cellMatch) {
    const [, column, row] = cellMatch;
    const rowIndex = parseInt(row);
    return {
      type: 'SINGLE',
      cell: cellOrRange,
      column,
      row: rowIndex,
      value,
      originalCommand: trimmedMessage
    };
  }

  return { error: 'Invalid format' };
};

console.log("Testing command parsing:");
testCommands.forEach((cmd, index) => {
  const result = parseCommand(cmd);
  console.log(`${index + 1}. "${cmd}" ->`, result);
}); 