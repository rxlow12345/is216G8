import axios from "axios";

// Support both development (via Vite proxy) and production (via env var)
const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api"; // Relative URL works with Vite proxy in dev or same origin in prod

const http = axios.create({
  baseURL: baseURL,
  timeout: 15000
});

export default http;
