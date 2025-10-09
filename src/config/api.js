// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const WS_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export default {
  API_BASE_URL,
  WS_URL
};