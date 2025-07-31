import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import logger from '../utils/logger';
import type { UserEvent, ActionEvent, StateEvent } from '../types';

export class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedClients = new Map<string, { socket: Socket; connectedAt: Date }>();

  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket'],
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 10000,
      allowUpgrades: true,
      maxHttpBufferSize: 1e6,
      connectTimeout: 45000,
      allowEIO3: true,
      allowRequest: (req, callback) => {
        callback(null, true); // Allow all connections
      }
    });

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });

    logger.info('WebSocket service initialized');
  }

  private handleConnection(socket: Socket): void {
    const clientId = socket.id;
    const connectedAt = new Date();
    
    this.connectedClients.set(clientId, { socket, connectedAt });
    
    logger.info(`WebSocket client connected: ${clientId} (Total: ${this.connectedClients.size})`);

    // Send initial connection confirmation
    socket.emit('connected', {
      clientId,
      timestamp: connectedAt.toISOString(),
      message: 'Connected to spreadsheet server'
    });

    // Handle client disconnect
    socket.on('disconnect', (reason) => {
      this.connectedClients.delete(clientId);
      logger.info(`WebSocket client disconnected: ${clientId} (Reason: ${reason}, Total: ${this.connectedClients.size})`);
    });

    // Handle client errors
    socket.on('error', (error: any) => {
      logger.error(`WebSocket client error: ${clientId}`, error);
    });

    // Handle custom events if needed
    socket.on('ping', () => {
      logger.info(`Received ping from client: ${clientId}`);
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Handle message sending
    socket.on('send_message', (data) => {
      logger.info(`Received message from client ${clientId}:`, data);
      // You can add custom message handling here if needed
    });

    // Log successful connection
    logger.info(`WebSocket client ${clientId} setup complete`);
  }

  // Broadcast spreadsheet update to all connected clients
  broadcastSpreadsheetUpdate(userEvent: UserEvent, actionEvent: ActionEvent, stateEvent: StateEvent): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized');
      return;
    }

    const updateData = {
      type: 'spreadsheet_update',
      timestamp: new Date().toISOString(),
      userEvent,
      actionEvent,
      stateEvent
    };

    this.io.emit('spreadsheet_update', updateData);
    logger.info(`Broadcasted spreadsheet update to ${this.connectedClients.size} clients`);
  }

  // Broadcast action events update
  broadcastActionEventsUpdate(actionEvents: ActionEvent[]): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized');
      return;
    }

    const updateData = {
      type: 'action_events_update',
      timestamp: new Date().toISOString(),
      actionEvents
    };

    this.io.emit('action_events_update', updateData);
    logger.info(`Broadcasted action events update to ${this.connectedClients.size} clients`);
  }

  // Broadcast state events update
  broadcastStateEventsUpdate(stateEvents: StateEvent[]): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized');
      return;
    }

    const updateData = {
      type: 'state_events_update',
      timestamp: new Date().toISOString(),
      stateEvents
    };

    this.io.emit('state_events_update', updateData);
    logger.info(`Broadcasted state events update to ${this.connectedClients.size} clients`);
  }

  // Test broadcast function
  broadcastTestMessage(): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized');
      return;
    }

    const testData = {
      type: 'test_message',
      timestamp: new Date().toISOString(),
      message: 'Test broadcast from server'
    };

    this.io.emit('test_message', testData);
    logger.info(`Broadcasted test message to ${this.connectedClients.size} clients`);
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Check if service is initialized
  isInitialized(): boolean {
    return this.io !== null;
  }

  // Get connection statistics
  getConnectionStats(): { total: number; connectedClients: string[] } {
    return {
      total: this.connectedClients.size,
      connectedClients: Array.from(this.connectedClients.keys())
    };
  }
}

// Export singleton instance
export const websocketService = new WebSocketService(); 