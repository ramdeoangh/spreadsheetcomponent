import request from 'supertest';
import express from 'express';
import { sendMessage, getActions, getState, getHealth } from '../../controllers/spreadsheetController';

// Create a test app
const app = express();
app.use(express.json());

// Add routes for testing
app.post('/message', sendMessage);
app.get('/action', getActions);
app.get('/state', getState);
app.get('/health', getHealth);

describe('SpreadsheetController', () => {
  describe('POST /message', () => {
    it('should process valid message', async () => {
      const response = await request(app)
        .post('/message')
        .send({
          message: 'A1 Hello World',
          userId: 'test-user',
          sessionId: 'test-session'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.userEvent).toBeDefined();
      expect(response.body.parsedCommand).toBeDefined();
    });

    it('should return 400 for missing message', async () => {
      const response = await request(app)
        .post('/message')
        .send({
          userId: 'test-user'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid message type', async () => {
      const response = await request(app)
        .post('/message')
        .send({
          message: 123,
          userId: 'test-user'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /action', () => {
    it('should return action events', async () => {
      const response = await request(app).get('/action');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.actions)).toBe(true);
      expect(response.body.count).toBeDefined();
    });
  });

  describe('GET /state', () => {
    it('should return spreadsheet state', async () => {
      const response = await request(app).get('/state');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.state).toBeDefined();
      expect(response.body.stateEvents).toBeDefined();
      expect(response.body.count).toBeDefined();
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.dataCounts).toBeDefined();
    });
  });
}); 