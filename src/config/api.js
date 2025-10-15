// api.js
const RAILWAY_BACKEND_URL = 'https://nflpool-production.up.railway.app';

// Prefer a build-time override (Vite env). If you set VITE_API_BASE it wins.
// Example (dev): VITE_API_BASE=http://localhost:3001/api vite
// Example (prod, GH Pages build): VITE_API_BASE=https://your-railway-app.up.railway.app/api
const envApiBase = import.meta.env.VITE_API_BASE;
const isDev = import.meta.env.DEV;

export const API_BASE_URL = envApiBase
  ? envApiBase.replace(/\/$/, '')
  : (isDev ? 'http://localhost:3001/api' : `${RAILWAY_BACKEND_URL}/api`);

export const WS_URL = isDev
  ? 'http://localhost:3001'
  : RAILWAY_BACKEND_URL;

export default { API_BASE_URL, WS_URL };