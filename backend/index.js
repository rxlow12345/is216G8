// backend/index.js
import express from "express"; // Web framework for REST API
import cors from "cors"; // Enables cross-origin request, frontend and backend are set on different port to simplifies deployment
import dotenv from "dotenv"; // Load .env config values into process.env
import path from "path"; // Handle filesystem paths in ESM mode
import { fileURLToPath } from "url";

dotenv.config({ path: "../.env" });

import "./src/firebase.js"; // init Admin SDK
import taskRoutes from "./src/routes/tasks.js";
import reportRoutes from "./src/routes/reports.js";

const app = express();
app.use(cors());

// Configure body parser with higher limits
app.use(express.json({ 
  limit: '100mb',
  type: 'application/json'
})); 

app.use(express.urlencoded({ 
  limit: '100mb', 
  extended: true,
  type: 'application/x-www-form-urlencoded'
}));

// API routes
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Critter Connect API is running" });
});

// Static file serving disabled for development

const PORT = process.env.PORT || 4100;
app.listen(PORT, () => console.log(`🐾 Critter Connect running on port ${PORT}`));
