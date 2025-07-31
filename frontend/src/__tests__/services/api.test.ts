import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService } from '../../services/api';

vi.mock('axios', () => {
  const mockAxios = {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxios),
    },
  };
});

// Import the mocked axios to access the mocks
import axios from 'axios';

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockResponse = { data: { success: true, userEvent: { id: '123', message: 'A1 Hello World' } } };
      (axios.create as any)().post.mockResolvedValue(mockResponse);

      const result = await apiService.sendMessage('A1 Hello World');

      expect((axios.create as any)().post).toHaveBeenCalledWith('/message', {
        message: 'A1 Hello World',
        userId: undefined,
        sessionId: undefined,
      });
      expect(result).toEqual(mockResponse.data.userEvent);
    });

    it('should send message with userId and sessionId', async () => {
      const mockResponse = { data: { success: true, userEvent: { id: '123', message: 'A1 Hello World' } } };
      (axios.create as any)().post.mockResolvedValue(mockResponse);

      const result = await apiService.sendMessage('A1 Hello World', 'user123', 'session456');

      expect((axios.create as any)().post).toHaveBeenCalledWith('/message', {
        message: 'A1 Hello World',
        userId: 'user123',
        sessionId: 'session456',
      });
      expect(result).toEqual(mockResponse.data.userEvent);
    });

    it('should handle error when sending message', async () => {
      const mockError = new Error('Network error');
      (axios.create as any)().post.mockRejectedValue(mockError);

      await expect(apiService.sendMessage('A1 Hello World')).rejects.toThrow('Network error');
    });
  });

  describe('getActions', () => {
    it('should get actions successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          actions: [
            { id: '1', type: 'UPDATE_CELL', data: { cell: 'A1', value: 'Hello' } },
          ],
        },
      };
      (axios.create as any)().get.mockResolvedValue(mockResponse);

      const result = await apiService.getActions();

      expect((axios.create as any)().get).toHaveBeenCalledWith('/action');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle error when getting actions', async () => {
      const mockError = new Error('Network error');
      (axios.create as any)().get.mockRejectedValue(mockError);

      await expect(apiService.getActions()).rejects.toThrow('Network error');
    });
  });

  describe('getState', () => {
    it('should get state successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          state: {
            cells: {},
            headers: ['A', 'B', 'C'],
            rows: 10,
            columns: 10,
          },
        },
      };
      (axios.create as any)().get.mockResolvedValue(mockResponse);

      const result = await apiService.getState();

      expect((axios.create as any)().get).toHaveBeenCalledWith('/state');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle error when getting state', async () => {
      const mockError = new Error('Network error');
      (axios.create as any)().get.mockRejectedValue(mockError);

      await expect(apiService.getState()).rejects.toThrow('Network error');
    });
  });
}); 