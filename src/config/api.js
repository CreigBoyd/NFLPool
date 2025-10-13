// API Configuration

// Railway backend URL
const RAILWAY_BACKEND_URL = 'https://nflpool-production.up.railway.app';

// Check if we're in development or production
const isDevelopment = import.meta.env.DEV;

// Use localhost for development, Railway for production
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001/api' 
  : `${RAILWAY_BACKEND_URL}/api`;

export const WS_URL = isDevelopment 
  ? 'http://localhost:3001' 
  : RAILWAY_BACKEND_URL;

export default {
  API_BASE_URL,
  WS_URL
};