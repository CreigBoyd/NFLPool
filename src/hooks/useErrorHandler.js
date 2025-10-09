import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState(null);

  const handleError = useCallback((err) => {
    console.error('Error caught:', err);
    
    // Parse error from API response
    if (err.response?.data) {
      setError({
        message: err.response.data.error || 'An error occurred',
        errorCode: err.response.data.errorCode,
        statusCode: err.response.status
      });
    } else if (err.message) {
      setError({
        message: err.message,
        errorCode: 'NETWORK_ERROR'
      });
    } else {
      setError({
        message: 'An unexpected error occurred',
        errorCode: 'UNKNOWN_ERROR'
      });
    }

    // Auto-dismiss after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}