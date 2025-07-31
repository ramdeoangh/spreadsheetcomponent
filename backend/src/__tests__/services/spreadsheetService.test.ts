import spreadsheetService from '../../services/spreadsheetService';
import { CustomError } from '../../middleware/errorHandler';

describe('SpreadsheetService', () => {
  beforeEach(() => {
    // Reset service state before each test
    jest.clearAllMocks();
  });

  describe('processUserMessage', () => {
    it('should process a valid cell command', async () => {
      const result = await spreadsheetService.processUserMessage('A1 Hello World');
      
      expect(result.userEvent.message).toBe('A1 Hello World');
      expect(result.actionEvent.action).toBe('UPDATE_CELL');
      expect(result.actionEvent.target).toEqual({ row: 0, col: 0 });
      expect(result.parsedCommand.cell).toBe('A1');
    });

    it('should process a command with equals sign', async () => {
      const result = await spreadsheetService.processUserMessage('B5 = 42');
      
      expect(result.userEvent.message).toBe('B5 = 42');
      expect(result.actionEvent.target).toEqual({ row: 4, col: 1 });
      expect(result.parsedCommand.cell).toBe('B5');
      expect(result.parsedCommand.value).toBe('42');
    });

    it('should process a general message', async () => {
      const result = await spreadsheetService.processUserMessage('Hello World');
      
      expect(result.userEvent.message).toBe('Hello World');
      expect(result.actionEvent.target).toEqual({ row: 0, col: 0 });
      expect(result.parsedCommand.value).toBe('Hello World');
    });

    it('should throw error for invalid column reference', async () => {
      await expect(
        spreadsheetService.processUserMessage('ZZZ1 Invalid')
      ).rejects.toThrow(CustomError);
    });

    it('should throw error for invalid row number', async () => {
      await expect(
        spreadsheetService.processUserMessage('A0 Invalid')
      ).rejects.toThrow(CustomError);
    });

    it('should include userId and sessionId', async () => {
      const result = await spreadsheetService.processUserMessage(
        'A1 Test',
        'user123',
        'session456'
      );
      
      expect(result.userEvent.userId).toBe('user123');
      expect(result.userEvent.sessionId).toBe('session456');
    });
  });

  describe('getActionEvents', () => {
    it('should return action events', async () => {
      const events = await spreadsheetService.getActionEvents();
      
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty('id');
      expect(events[0]).toHaveProperty('action');
      expect(events[0]).toHaveProperty('timestamp');
    });
  });

  describe('getSpreadsheetState', () => {
    it('should return spreadsheet state', async () => {
      const state = await spreadsheetService.getSpreadsheetState();
      
      expect(state).toHaveProperty('cells');
      expect(state).toHaveProperty('rows');
      expect(state).toHaveProperty('columns');
      expect(state).toHaveProperty('headers');
      expect(state.rows).toBe(100);
      expect(state.columns).toBe(26);
      expect(Array.isArray(state.headers)).toBe(true);
    });
  });

  describe('getStateEvents', () => {
    it('should return state events', async () => {
      const events = await spreadsheetService.getStateEvents();
      
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty('id');
      expect(events[0]).toHaveProperty('type');
      expect(events[0]).toHaveProperty('timestamp');
    });
  });

  describe('getHealthStatus', () => {
    it('should return health status', async () => {
      const health = await spreadsheetService.getHealthStatus();
      
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('endpoints');
      expect(health).toHaveProperty('dataCounts');
      expect(health.status).toBe('OK');
      expect(Array.isArray(health.endpoints)).toBe(true);
      expect(health.dataCounts).toHaveProperty('userEvents');
      expect(health.dataCounts).toHaveProperty('actionEvents');
      expect(health.dataCounts).toHaveProperty('stateEvents');
      expect(health.dataCounts).toHaveProperty('cells');
    });
  });
}); 