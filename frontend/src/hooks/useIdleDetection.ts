import { useState, useEffect, useRef, useCallback } from 'react';

interface UseIdleDetectionOptions {
  idleTime?: number; // Time in milliseconds before considered idle
  events?: string[]; // Events to listen for activity
  onIdle?: () => void;
  onActive?: () => void;
}

export const useIdleDetection = (options: UseIdleDetectionOptions = {}) => {
  const {
    idleTime = 30000, // 30 seconds default
    events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'],
    onIdle,
    onActive
  } = options;

  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef(Date.now());

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const wasIdle = isIdle;
    setIsIdle(false);
    lastActivityRef.current = Date.now();

    if (wasIdle && onActive) {
      onActive();
    }

    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      if (onIdle) {
        onIdle();
      }
    }, idleTime);
  }, [idleTime, isIdle, onIdle, onActive]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Start the initial timer
    resetTimer();

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [events, handleActivity, resetTimer]);

  const forceIdle = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsIdle(true);
    if (onIdle) {
      onIdle();
    }
  }, [onIdle]);

  const forceActive = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  return {
    isIdle,
    forceIdle,
    forceActive,
    lastActivity: lastActivityRef.current
  };
}; 