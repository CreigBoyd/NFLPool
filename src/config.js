// src/config.js - Frontend API Configuration

const isDevelopment = import.meta.env.MODE === 'development';

const config = {
  // API Base URL
  apiUrl: isDevelopment
    ? 'http://localhost:3001/api'
    : 'https://nflpool-production.up.railway.app/api', // REPLACE THIS!
  
  // WebSocket URL
  wsUrl: isDevelopment
    ? 'http://localhost:3001'
    : 'https://nflpool-production.up.railway.app', // REPLACE THIS!
  
  // App Settings
  appName: '603E Pool',
  version: '1.0.0',
  
  // Timeouts
  apiTimeout: 30000, // 30 seconds
  
  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100,
};

export default config;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${config.apiUrl}/${cleanEndpoint}`;
};

// Helper for WebSocket connection
export const getWebSocketUrl = () => {
  return config.wsUrl;
};