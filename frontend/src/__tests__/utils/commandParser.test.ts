import { describe, it, expect } from 'vitest';
import { parseCommand, formatCellRef } from '../../utils/commandParser';

describe('Command Parser', () => {
  describe('parseCommand', () => {
    it('should parse valid cell command with space', () => {
      const result = parseCommand('A1 Hello World');
      
      expect(result.type).toBe('CELL_UPDATE');
      expect(result.cellRef).toBe('A1');
      expect(result.row).toBe(0);
      expect(result.col).toBe(0);
      expect(result.value).toBe('Hello World');
    });

    it('should parse valid cell command with equals sign', () => {
      const result = parseCommand('B5 = 42');
      
      expect(result.type).toBe('CELL_UPDATE');
      expect(result.cellRef).toBe('B5');
      expect(result.row).toBe(4);
      expect(result.col).toBe(1);
      expect(result.value).toBe('42');
    });

    it('should parse valid cell command with equals sign and spaces', () => {
      const result = parseCommand('C3 = Test Value');
      
      expect(result.type).toBe('CELL_UPDATE');
      expect(result.cellRef).toBe('C3');
      expect(result.row).toBe(2);
      expect(result.col).toBe(2);
      expect(result.value).toBe('Test Value');
    });

    it('should parse multi-letter column references', () => {
      const result = parseCommand('AA1 Test');
      
      expect(result.type).toBe('CELL_UPDATE');
      expect(result.cellRef).toBe('AA1');
      expect(result.row).toBe(0);
      expect(result.col).toBe(26); // AA = 27th column (0-based = 26)
      expect(result.value).toBe('Test');
    });

    it('should parse general message without cell reference', () => {
      const result = parseCommand('Hello World');
      
      expect(result.type).toBe('CELL_UPDATE');
      expect(result.cellRef).toBeUndefined();
      expect(result.row).toBe(0);
      expect(result.col).toBe(0);
      expect(result.value).toBe('Hello World');
    });

    it('should handle empty string', () => {
      const result = parseCommand('');
      
      expect(result.type).toBe('CELL_UPDATE');
      expect(result.row).toBe(0);
      expect(result.col).toBe(0);
      expect(result.value).toBe('');
    });

    it('should handle whitespace-only string', () => {
      const result = parseCommand('   ');
      
      expect(result.type).toBe('CELL_UPDATE');
      expect(result.row).toBe(0);
      expect(result.col).toBe(0);
      expect(result.value).toBe('');
    });

    it('should return INVALID for invalid column reference', () => {
      const result = parseCommand('ZZZ1 Invalid');
      
      expect(result.type).toBe('INVALID');
      expect(result.error).toBe('Invalid column reference: ZZZ');
    });

    it('should return INVALID for invalid row number', () => {
      const result = parseCommand('A0 Invalid');
      
      expect(result.type).toBe('INVALID');
      expect(result.error).toBe('Invalid row number: 0');
    });

    it('should return INVALID for zero row number', () => {
      const result = parseCommand('A0 Invalid');
      
      expect(result.type).toBe('INVALID');
      expect(result.error).toBe('Invalid row number: 0');
    });

    it('should handle case-insensitive column references', () => {
      const result = parseCommand('a1 Test');
      
      expect(result.type).toBe('CELL_UPDATE');
      expect(result.cellRef).toBe('a1');
      expect(result.row).toBe(0);
      expect(result.col).toBe(0);
      expect(result.value).toBe('Test');
    });

    it('should handle mixed case column references', () => {
      const result = parseCommand('Aa1 Test');
      
      expect(result.type).toBe('CELL_UPDATE');
      expect(result.cellRef).toBe('Aa1');
      expect(result.row).toBe(0);
      expect(result.col).toBe(26); // AA = 27th column (0-based = 26)
      expect(result.value).toBe('Test');
    });
  });

  describe('formatCellRef', () => {
    it('should format single letter column', () => {
      expect(formatCellRef(0, 0)).toBe('A1');
      expect(formatCellRef(1, 0)).toBe('A2');
      expect(formatCellRef(0, 1)).toBe('B1');
      expect(formatCellRef(5, 2)).toBe('C6');
    });

    it('should format multi-letter columns', () => {
      expect(formatCellRef(0, 26)).toBe('AA1'); // 27th column
      expect(formatCellRef(1, 26)).toBe('AA2');
      expect(formatCellRef(0, 27)).toBe('AB1'); // 28th column
      expect(formatCellRef(10, 26)).toBe('AA11');
    });

    it('should handle edge cases', () => {
      expect(formatCellRef(0, 25)).toBe('Z1'); // 26th column
      expect(formatCellRef(0, 26)).toBe('AA1'); // 27th column
      expect(formatCellRef(0, 51)).toBe('AZ1'); // 52nd column
      expect(formatCellRef(0, 52)).toBe('BA1'); // 53rd column
    });
  });
}); 