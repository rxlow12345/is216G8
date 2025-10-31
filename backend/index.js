// backend/index.js
import express from "express"; // Web framework for REST API
import cors from "cors"; // Enables cross-origin request, frontend and backend are set on different port to simplifies deployment
import dotenv from "dotenv"; // Load .env config values into process.env
import { Server } from 'socket.io';
import http from 'http'; 


// dotenv.config({ path: "../.env" });

dotenv.config();

import "./src/firebase.js"; // init Admin SDK
import taskRoutes from "./src/routes/tasks.js";
import reportRoutes from "./src/routes/reports.js";
import mapRoutes from "./src/routes/maps.js";

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
app.use("/api/maps", mapRoutes);

const server = http.createServer(app);
// SOCKET 
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5175',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});
server.listen(3000, () => console.log('Server running on port 3000'));
// Make io accessible in routes
app.set('io', io);

// WebSocket connection handling
let connectedClients = new Set();

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  connectedClients.add(socket.id);
  
  // Send current client count to all
  io.emit('client-count', connectedClients.size);

  // Handle location updates from volunteers
  socket.on('update-location', (locationData) => {
    console.log('📍 Location update from:', socket.id);
    // Broadcast to other clients
    socket.broadcast.emit('volunteer-location', {
      socketId: socket.id,
      ...locationData
    });
  });

  // Handle report acceptance
  socket.on('accept-report', (data) => {
    console.log('✅ Report accepted:', data.reportId);
    io.emit('report-accepted', {
      reportId: data.reportId,
      volunteerId: socket.id,
      volunteerName: data.volunteerName
    });
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('🔌 Client disconnected:', socket.id, '-', reason);
    connectedClients.delete(socket.id);
    io.emit('client-count', connectedClients.size);
  });
});

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

const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`🐾 Critter Connect running on port ${PORT}`));
