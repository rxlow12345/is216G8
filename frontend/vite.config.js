import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5175,          // avoid conflicts with other projects
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:4100", // backend port
        changeOrigin: true,
        secure: false
      }
    }
  }
});
