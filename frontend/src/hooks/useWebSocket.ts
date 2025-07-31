import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketEvent {
  type: 'spreadsheet_update' | 'action_events_update' | 'state_events_update' | 'connected' | 'pong' | 'test_message';
  timestamp: string;
  userEvent?: any;
  actionEvent?: any;
  stateEvent?: any;
  actionEvents?: any[];
  stateEvents?: any[];
  message?: string;
}

// Global socket instance to prevent multiple connections
let globalSocket: Socket | null = null;
let connectionPromise: Promise<void> | null = null;
let lastConnectionAttempt = 0;

export const useWebSocket = (
  onSpreadsheetUpdate?: (data: WebSocketEvent) => void,
  onActionEventsUpdate?: (data: WebSocketEvent) => void,
  onStateEventsUpdate?: (data: WebSocketEvent) => void,
  onConnect?: () => void,
  onDisconnect?: () => void,
  isIdle?: boolean // Add idle state parameter
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventHandlersRef = useRef({
    onSpreadsheetUpdate,
    onActionEventsUpdate,
    onStateEventsUpdate,
    onConnect,
    onDisconnect
  });

  // Update event handlers when they change
  useEffect(() => {
    eventHandlersRef.current = {
      onSpreadsheetUpdate,
      onActionEventsUpdate,
      onStateEventsUpdate,
      onConnect,
      onDisconnect
    };
  }, [onSpreadsheetUpdate, onActionEventsUpdate, onStateEventsUpdate, onConnect, onDisconnect]);

  const connect = useCallback(async () => {
    if (globalSocket?.connected) {
      setIsConnected(true);
      setConnectionError(null);
      return;
    }

    // Throttle connection attempts
    const now = Date.now();
    if (now - lastConnectionAttempt < 2000) { // 2 seconds between attempts
      console.log('Connection attempt throttled');
      return;
    }
    lastConnectionAttempt = now;

    if (connectionPromise) {
      await connectionPromise;
      return;
    }

    connectionPromise = new Promise<void>((resolve, reject) => {
      try {
        console.log('Creating new WebSocket connection...');
        
        if (globalSocket) {
          globalSocket.disconnect();
          globalSocket = null;
        }

        const socket = io('http://localhost:3001', {
          transports: ['websocket'],
          autoConnect: true,
          reconnection: false, // Disable auto-reconnection
          timeout: 10000,
          forceNew: true
        });

        globalSocket = socket;

        socket.on('connect', () => {
          console.log('WebSocket connected:', socket.id);
          setIsConnected(true);
          setConnectionError(null);
          eventHandlersRef.current.onConnect?.();
          resolve();
        });

        socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          setIsConnected(false);
          eventHandlersRef.current.onDisconnect?.();
          globalSocket = null;
          connectionPromise = null;
        });

        socket.on('connect_error', (error: any) => {
          console.error('WebSocket connection error:', error);
          setConnectionError(error.message);
          setIsConnected(false);
          globalSocket = null;
          connectionPromise = null;
          reject(error);
        });

        socket.on('spreadsheet_update', (data: WebSocketEvent) => {
          console.log('WebSocket spreadsheet update received:', data);
          // Only process updates if not idle
          if (!isIdle) {
            eventHandlersRef.current.onSpreadsheetUpdate?.(data);
          } else {
            console.log('Ignoring spreadsheet update - user is idle');
          }
        });

        socket.on('action_events_update', (data: WebSocketEvent) => {
          console.log('WebSocket action events update received:', data);
          // Only process updates if not idle
          if (!isIdle) {
            eventHandlersRef.current.onActionEventsUpdate?.(data);
          } else {
            console.log('Ignoring action events update - user is idle');
          }
        });

        socket.on('state_events_update', (data: WebSocketEvent) => {
          console.log('WebSocket state events update received:', data);
          // Only process updates if not idle
          if (!isIdle) {
            eventHandlersRef.current.onStateEventsUpdate?.(data);
          } else {
            console.log('Ignoring state events update - user is idle');
          }
        });

        socket.on('connected', (data: WebSocketEvent) => {
          console.log('WebSocket server confirmation:', data);
        });

        socket.on('pong', (data: WebSocketEvent) => {
          console.log('WebSocket pong received:', data);
        });

        socket.on('test_message', (data: WebSocketEvent) => {
          console.log('WebSocket test message received:', data);
        });

      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        setConnectionError('Failed to create WebSocket connection');
        globalSocket = null;
        connectionPromise = null;
        reject(error);
      }
    });

    try {
      await connectionPromise;
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }, [isIdle]);

  const disconnect = useCallback(() => {
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
    }
    connectionPromise = null;
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (globalSocket?.connected) {
      globalSocket.emit('send_message', { message });
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      // Don't disconnect on unmount to keep connection alive
    };
  }, [connect]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    connect,
    disconnect
  };
}; 