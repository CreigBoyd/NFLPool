// src/components/ToastContainer.jsx
import React from 'react';
import { useToast } from '../contexts/ToastContext';
import Toast from './Toast';

const ToastContainer = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div id="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;