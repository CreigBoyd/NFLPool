// api.js
const RAILWAY_BACKEND_URL = 'https://nflpool-production.up.railway.app';


const envApiBase = import.meta.env.VITE_API_BASE;
const isDev = import.meta.env.DEV;

export const API_BASE_URL = envApiBase
  ? envApiBase.replace(/\/$/, '')
  : (isDev ? 'http://localhost:3001/api' : `${RAILWAY_BACKEND_URL}/api`);

export const WS_URL = isDev
  ? 'http://localhost:3001'
  : RAILWAY_BACKEND_URL;

export default { API_BASE_URL, WS_URL };