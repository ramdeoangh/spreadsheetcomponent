import { Request, Response, NextFunction } from 'express';
import spreadsheetService from '../services/spreadsheetService';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

export const sendMessage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { message, userId, sessionId } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Message is required and must be a string'
    });
  }

  try {
    const result = await spreadsheetService.processUserMessage(message, userId, sessionId);
    
    logger.info(`Message processed successfully: ${message}`);
    
    res.json({
      success: true,
      message: 'User event processed successfully',
      userEvent: result.userEvent,
      parsedCommand: result.parsedCommand
    });
  } catch (error) {
    logger.error(`Error in sendMessage: ${error}`);
    next(error);
  }
});

export const getActions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actions = await spreadsheetService.getActionEvents();
    
    logger.info(`Retrieved ${actions.length} action events`);
    
    res.json({
      success: true,
      actions,
      count: actions.length
    });
  } catch (error) {
    logger.error(`Error in getActions: ${error}`);
    next(error);
  }
});

export const getState = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [state, stateEvents] = await Promise.all([
      spreadsheetService.getSpreadsheetState(),
      spreadsheetService.getStateEvents()
    ]);
    
    logger.info(`Retrieved spreadsheet state with ${state.cells.length} cells and ${stateEvents.length} state events`);
    logger.debug('State response:', JSON.stringify({ state, stateEvents }, null, 2));
    
    const response = {
      success: true,
      state,
      stateEvents,
      count: stateEvents.length
    };
    
    logger.info('Sending state response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    logger.error(`Error in getState: ${error}`);
    next(error);
  }
});

export const getHealth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const healthStatus = await spreadsheetService.getHealthStatus();
    
    logger.info('Health check performed');
    
    res.json(healthStatus);
  } catch (error) {
    logger.error(`Error in getHealth: ${error}`);
    next(error);
  }
});

export const testWebSocket = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { websocketService } = await import('../services/websocketService');
    websocketService.broadcastTestMessage();
    
    logger.info('WebSocket test broadcast sent');
    
    res.json({
      success: true,
      message: 'Test broadcast sent to all connected clients'
    });
  } catch (error) {
    logger.error(`Error in testWebSocket: ${error}`);
    next(error);
  }
}); 