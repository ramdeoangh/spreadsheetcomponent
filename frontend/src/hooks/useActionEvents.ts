import { useState, useEffect, useCallback } from 'react';
import type { ActionEvent } from '../types';
import { apiService } from '../services/api';

export const useActionEvents = () => {
  const [actionEvents, setActionEvents] = useState<ActionEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActionEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getActions();
      if (response.success) {
        setActionEvents(response.actions);
      } else {
        setError('Failed to load action events');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load action events';
      setError(errorMessage);
      console.error('Error loading action events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshActionEvents = useCallback(async () => {
    await loadActionEvents();
  }, [loadActionEvents]);

  // Load initial data only
  useEffect(() => {
    loadActionEvents();
  }, [loadActionEvents]);

  return {
    actionEvents,
    loading,
    error,
    refreshActionEvents,
  };
}; 