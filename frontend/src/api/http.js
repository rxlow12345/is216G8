import axios from "axios";

const http = axios.create({
  // For dev via Vite proxy, keep this as relative:
  baseURL: "/api",
  timeout: 15000
});

export default http;
