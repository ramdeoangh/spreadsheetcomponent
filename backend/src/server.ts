import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { config } from './config';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import spreadsheetRoutes from './routes/spreadsheetRoutes';
import { websocketService } from './services/websocketService';

class Server {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeWebSocket();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors(config.cors));
    
    // Rate limiting
    const limiter = rateLimit(config.api.rateLimit);
    this.app.use(limiter);
    
    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // HTTP request logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));
  }

  private initializeRoutes(): void {
    this.app.use(config.api.prefix, spreadsheetRoutes);
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  private initializeWebSocket(): void {
    websocketService.initialize(this.server);
  }

  public start(): void {
    const port = Number(config.server.port);
    const host = config.server.host;
    
    this.server.listen(port, host, () => {
      logger.info('🚀 Server running on http://localhost:3001');
      logger.info('📊 Environment: development');
      logger.info('🔗 API Base URL: /api');
      logger.info('🌐 CORS Origin: http://localhost:5173');
      logger.info('🔌 WebSocket: ws://localhost:3001');
      logger.info('\n📋 Available endpoints:');
      logger.info('  POST /api/message - Accept UserEvent');
      logger.info('  GET  /api/action - Get ActionEvents');
      logger.info('  GET  /api/state - Get StateEvents and SpreadsheetState');
      logger.info('  GET  /api/health - Health check');
      logger.info('  WS   /socket.io - WebSocket connection');
      logger.info('\n💡 Command Examples:');
      logger.info('  A1 Hello World');
      logger.info('  B5 = 42');
      logger.info('  C3 Test Message');
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getServer(): any {
    return this.server;
  }
}

export default Server; 