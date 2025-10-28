const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible in routes
app.set('io', io);

// Import routes
const reportsRouter = require('./routes/reports');

// Use routes
app.use('/api/reports', reportsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'CritterConnect API Server',
    version: '1.0.0'
  });
});

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('🚀 Server running on port', PORT);
  console.log('📡 WebSocket ready');
  console.log('🌐 Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:5173');
});

module.exports = { app, io, server };