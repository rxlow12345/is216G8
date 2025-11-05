import axios from "axios";

// Support both development (via Vite proxy) and production (via env var)
// In dev (localhost): uses Vite proxy to /api -> localhost:4100
// In prod: uses VITE_API_URL if set, otherwise falls back to relative /api
let baseURL = '/api'; // Default: relative path (uses Vite proxy in dev)

if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
  // Production: use full URL, check if /api is already included
  const viteUrl = import.meta.env.VITE_API_URL;
  if (viteUrl.endsWith('/api')) {
    baseURL = viteUrl;
  } else {
    baseURL = `${viteUrl}/api`;
  }
} else {
  // Localhost or no VITE_API_URL: use relative path (Vite proxy)
  baseURL = '/api';
}

const http = axios.create({
  baseURL: baseURL,
  timeout: 15000
});

export default http;
