import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Connect to WebSocket server
  connect(url = null) {
    // Use provided URL, or VITE_SOCKET_URL, or fallback to localhost for dev
    if (!url) {
      if (import.meta.env.VITE_SOCKET_URL && !import.meta.env.VITE_SOCKET_URL.includes('localhost')) {
        // Production: use VITE_SOCKET_URL
        url = import.meta.env.VITE_SOCKET_URL;
      } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Localhost: use local backend
        url = "http://localhost:4100";
      } else {
        // Production without VITE_SOCKET_URL: try to derive from window.location
        // This won't work for WebSocket, so we need VITE_SOCKET_URL
        url = null;
      }
    }
    
    if (!url) {
      console.warn("No socket URL configured. Please set VITE_SOCKET_URL environment variable.");
      return;
    }
    if (this.socket?.connected) {
      console.log("Already connected");
      return;
    }

    this.socket = io(url, {
      transports: ["websocket"], // Prefer WebSocket directly
      reconnection: true, // Auto-reconnect
      reconnectionAttempts: Infinity, // Keep trying during dev
      reconnectionDelay: 300, // Start fast
      reconnectionDelayMax: 1500, // Cap delay
      randomizationFactor: 0.2, // Slight jitter to avoid thundering herd
      timeout: 2500, // Faster connection timeout
    });

    // Connection events
    this.socket.on("connect", () => {
      console.log("✅ Connected to server:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  // Set up default event listeners
  setupEventListeners() {
    // Listen for new reports
    this.socket.on("new-report", (report) => {
      this.emit("new-report", report);
    });

    // Listen for report updates
    this.socket.on("report-updated", (report) => {
      this.emit("report-updated", report);
    });

    // Listen for report deletions
    this.socket.on("report-deleted", (reportId) => {
      this.emit("report-deleted", reportId);
    });

    // Listen for user count updates
    this.socket.on("client-count", (count) => {
      this.emit("client-count", count);
    });
  }

  // Register event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  // Emit to all registered listeners
  emit(event, data) {
    if (!this.listeners.has(event)) return;

    this.listeners.get(event).forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  // Send data to server
  send(event, data) {
    if (!this.socket?.connected) {
      console.warn("Socket not connected. Cannot send:", event);
      return;
    }
    this.socket.emit(event, data);
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log("Disconnected from server");
    }
  }
}

// Export a single instance (singleton)
export default new SocketService();
