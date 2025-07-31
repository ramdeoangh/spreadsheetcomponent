import axios from 'axios';
import type { UserEvent, ActionResponse, StateResponse } from '../types';
import { API_CONFIG } from '../utils/constants';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // POST /message - Send user event
  sendMessage: async (message: string, userId?: string, sessionId?: string): Promise<UserEvent> => {
    const response = await api.post('/message', {
      message,
      userId,
      sessionId,
    });
    return response.data.userEvent;
  },

  // GET /action - Get action events
  getActions: async (): Promise<ActionResponse> => {
    const response = await api.get('/action');
    return response.data;
  },

  // GET /state - Get state events and spreadsheet state
  getState: async (): Promise<StateResponse> => {
    const response = await api.get('/state');
    return response.data;
  },

  // GET /health - Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
}; 