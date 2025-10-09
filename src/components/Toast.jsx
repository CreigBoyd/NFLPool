// src/components/Toast.jsx
import React from 'react';
import { useToast } from '../contexts/ToastContext';

const Toast = ({ toast }) => {
  const { removeToast } = useToast();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-exclamation-circle';
      case 'warning':
        return 'fa-exclamation-triangle';
      case 'info':
        return 'fa-info-circle';
      case 'professional':
      default:
        return 'fa-football';
    }
  };

  const handleClick = () => {
    removeToast(toast.id);
  };

  return (
    <div
      className={`toast toast-bounce ${toast.type}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <i className={`fa-solid ${getIcon(toast.type)}`}></i>
      <span>{toast.message}</span>
    </div>
  );
};

export default Toast;