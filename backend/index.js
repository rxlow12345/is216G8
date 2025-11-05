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
// CORS configuration - support both development and production URLs
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5175'];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
 
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
const socketOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5175'];
const io = new Server(server, {
  cors: {
    origin: socketOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});
const PORT = process.env.PORT || 4100;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
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
