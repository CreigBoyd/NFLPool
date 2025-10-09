// src/contexts/ToastContext.jsx - Updated with duplicate prevention
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const recentToastsRef = useRef(new Set());

  const addToast = useCallback((message, type = 'professional', duration = 7000) => {
    // Create unique key for this toast
    const toastKey = `${type}-${message}`;
    
    // Prevent duplicate toasts within 1 second
    if (recentToastsRef.current.has(toastKey)) {
      return;
    }

    // Add to recent toasts to prevent duplicates
    recentToastsRef.current.add(toastKey);
    
    // Remove from recent toasts after 1 second
    setTimeout(() => {
      recentToastsRef.current.delete(toastKey);
    }, 1000);

    const id = Math.random().toString(36).substr(2, 9);
    const toast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message) => addToast(message, 'success'), [addToast]);
  const showError = useCallback((message) => addToast(message, 'error'), [addToast]);
  const showWarning = useCallback((message) => addToast(message, 'warning'), [addToast]);
  const showInfo = useCallback((message) => addToast(message, 'info'), [addToast]);
  const showProfessional = useCallback((message) => addToast(message, 'professional'), [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showProfessional
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};