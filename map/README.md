Currently the features and aesthetics differ significantly from our figma prototype, will be adjusting it later. 
Yet to be linked to our firebase as well. 

File Structure
frontend/
├── src/
│   ├── App.vue                     🎯 ROOT COMPONENT
│   │   Purpose: Main app wrapper, global styles
│   │   Role: Wraps everything, provides base CSS
│   │
│   ├── main.js                     🚀 ENTRY POINT
│   │   Purpose: Initializes Vue app, mounts to DOM
│   │   Role: Starts the entire application
│   │
│   ├── router/
│   │   └── index.js                🗺️ NAVIGATION
│   │       Purpose: Defines routes (URLs → Components)
│   │       Role: Controls which page shows at which URL
│   │
│   ├── views/
│   │   └── RescueDashboard.vue     📊 MAIN PAGE
│   │       Purpose: Complete dashboard with sidebar + map
│   │       Role: Orchestrates all components, manages state
│   │       Contains: Reports list, filters, modal, WebSocket logic
│   │
│   ├── components/
│   │   ├── MapView.vue             🗺️ MAP DISPLAY
│   │   │   Purpose: Renders Leaflet map with markers
│   │   │   Role: Shows animal locations, handles clicks
│   │   │   Uses: Leaflet.js, OpenCage geocoding
│   │   │
│   │   └── ReportCard.vue          🃏 REPORT CARDS
│   │       Purpose: Individual report item in sidebar
│   │       Role: Displays report info, handles selection
│   │
│   └── services/
│       ├── api.js                  🔌 HTTP REQUESTS
│       │   Purpose: All backend API calls
│       │   Role: CRUD operations (Create, Read, Update, Delete)
│       │   Methods: getReports(), createReport(), updateReportStatus()
│       │
│       └── socket.js               ⚡ REAL-TIME UPDATES
│           Purpose: WebSocket connection
│           Role: Receives live updates from server
│           Events: new-report, report-updated, report-deleted
│
├── .env                            🔑 CONFIGURATION
│   Purpose: API keys and URLs
│   Contains: VITE_OPENCAGE_API_KEY, VITE_API_URL
│
└── package.json                    📦 DEPENDENCIES
    Purpose: Lists all npm packages needed
    Contains: vue, leaflet, socket.io-client, axios
```

### **Backend Files**
```
backend/
├── server.js                       🖥️ MAIN SERVER
│   Purpose: Express server + WebSocket server
│   Role: Handles HTTP requests, manages WebSocket connections
│   Does: 
│     - Starts Express server on port 3000
│     - Initializes Socket.io for real-time
│     - Sets up CORS for frontend communication
│     - Routes all /api/reports to reports.js
│
├── routes/
│   └── reports.js                  📋 REPORTS API
│       Purpose: All report-related endpoints
│       Role: CRUD operations for animal reports
│       Endpoints:
│         GET    /api/reports          → Get all reports
│         GET    /api/reports/:id     → Get one report
│         POST   /api/reports         → Create report
│         PUT    /api/reports/:id     → Update report
│         DELETE /api/reports/:id     → Delete report
│
├── .env                            🔑 CONFIGURATION
│   Purpose: Server settings
│   Contains: PORT, FRONTEND_URL, Firebase keys
│
└── package.json                    📦 DEPENDENCIES
    Purpose: Backend packages
    Contains: express, cors, socket.io, firebase-admin
```

---

## 🔄 Part 2: How Everything Connects

### **Startup Flow:**
```
1. User opens browser → http://localhost:5173
   ↓
2. main.js runs → Creates Vue app
   ↓
3. router/index.js checks URL → Loads RescueDashboard.vue
   ↓
4. RescueDashboard.vue mounts:
   ├─→ Calls api.js.getReports() → HTTP request to backend
   ├─→ Calls socket.js.connect() → WebSocket to backend
   ├─→ Renders MapView.vue (passes reports as props)
   └─→ Renders ReportCard.vue for each report
   ↓
5. Backend receives requests:
   ├─→ Express handles HTTP (routes/reports.js)
   └─→ Socket.io handles WebSocket (server.js)
```

### **Data Flow - Creating a Report:**
```
User clicks "Create Report" in frontend
   ↓
api.js → POST /api/reports
   ↓
Backend routes/reports.js receives request
   ↓
Saves to database (currently in-memory array)
   ↓
Broadcasts via Socket.io: io.emit('new-report', newReport)
   ↓
All connected clients receive WebSocket event
   ↓
socket.js captures event → calls registered listener
   ↓
RescueDashboard.vue adds report to reports array
   ↓
Vue reactivity updates:
   ├─→ ReportCard.vue (new card appears in sidebar)
   └─→ MapView.vue (new marker appears on map)
```

### **Component Communication:**
```
RescueDashboard.vue (Parent)
   │
   ├─→ Props down → MapView.vue
   │    Sends: reports array, center coordinates
   │    Receives: @marker-click events
   │
   └─→ Props down → ReportCard.vue (multiple instances)
        Sends: individual report object, selected status
        Receives: @click events
