<template>
  <!-- Left Sidebar -->
  <div class="rescuemapwrapper">
    <div class="sidebar">
      <!-- Header -->
      <div class="header">
        <h1>🐾 CritterConnect</h1>
        <p class="subtitle">Real-time Animal Rescue</p>

        <!-- Connection Status -->
        <div class="connection-status">
          <span class="status-dot" :class="{ active: isConnected }"></span>
          <span>{{ isConnected ? "Online" : "Offline" }}</span>
          <span v-if="activeUsers > 0">({{ activeUsers }} active)</span>
        </div>
      </div>

      <!-- Filter Buttons -->
      <div class="filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="currentFilter = filter.value"
          :class="['filter-btn', { active: currentFilter === filter.value }]"
        >
          {{ filter.label }} ({{ getCount(filter.value) }})
        </button>
      </div>

      <!-- Reports List -->
      <div class="reports-list">
        <ReportCard
          v-for="report in filteredReports"
          :key="report.id"
          :report="report"
          :selected="selectedReportId === report.id"
          @click="selectReport(report)"
        />
        <ReportCard
          v-for="report in filteredReports"
          :key="report.id"
          :report="report"
          :selected="selectedReportId === report.id"
          @click="selectReport(report)"
        />

        <div v-if="filteredReports.length === 0" class="empty-state">
          <p>No reports found</p>
        </div>
      </div>
    </div>

    <!-- Right Side: Map -->
    <div class="map-container">
      <MapView :reports="filteredReports" :center="mapCenter" />
    </div>
  </div>

  <!-- Report Details Modal -->
  <div v-if="selectedReport" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <button class="close-btn" @click="closeModal">×</button>

      <h2>{{ selectedReport.animalType }}</h2>
      <p class="modal-address">📍 {{ selectedReport.address }}</p>

      <div class="modal-details">
        <div class="detail-row">
          <span class="label">Status:</span>
          <span class="value status" :class="`status-${selectedReport.status}`">
            {{ selectedReport.status }}
          </span>
        </div>

        <div class="detail-row">
          <span class="label">Urgency:</span>
          <span
            class="value urgency"
            :class="`urgency-${selectedReport.urgency}`"
          >
            {{ selectedReport.urgency }}
          </span>
        </div>

        <div class="detail-row">
          <span class="label">Description:</span>
          <p class="value">{{ selectedReport.description }}</p>
        </div>

        <div class="detail-row">
          <span class="label">Reported by:</span>
          <span class="value">{{ selectedReport.reporter }}</span>
        </div>

        <div class="detail-row">
          <span class="label">Time:</span>
          <span class="value">{{
            formatDateTime(selectedReport.reportedAt)
          }}</span>
        </div>

        <div v-if="selectedReport.assignedTo" class="detail-row">
          <span class="label">Assigned to:</span>
          <span class="value">{{ selectedReport.assignedTo }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="modal-actions">
        <button
          v-if="selectedReport.status === 'pending'"
          @click="acceptCase"
          class="btn btn-primary"
        >
          Accept Case
        </button>

        <button
          v-if="selectedReport.status === 'in-progress'"
          @click="resolveCase"
          class="btn btn-success"
        >
          Mark as Resolved
        </button>

        <button @click="closeModal" class="btn btn-secondary">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import MapView from "../../src/components/MapView.vue";
import ReportCard from "../../src/components/ReportCard.vue";
import api from "../../src/api/mapapi";
import socket from "../../src/api/socket";

export default {
  name: "RescueMap",
  components: {
    MapView,
    ReportCard,
  },
  data() {
    return {
      reports: [],
      selectedReportId: null,
      currentFilter: "all",
      isConnected: false,
      activeUsers: 0,
      mapCenter: { lat: 1.3521, lng: 103.8198 }, // Singapore
      filters: [
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Active", value: "in-progress" },
        { label: "Resolved", value: "resolved" },
      ],
    };
  },
  computed: {
    filteredReports() {
      if (this.currentFilter === "all") {
        return this.reports;
      }
      return this.reports.filter((r) => r.status === this.currentFilter);
    },
    selectedReport() {
      return this.reports.find((r) => r.id === this.selectedReportId);
    },
  },
  async mounted() {
    await this.loadReports();
    this.connectWebSocket();
    this.setupGlobalFunctions();
  },
  beforeUnmount() {
    socket.disconnect();
  },
  methods: {
    async loadReports() {
      try {
        const response = await api.getReports();
        this.reports = response.data;
      } catch (error) {
        console.error("Error loading reports:", error);
        alert("Failed to load reports. Make sure backend is running!");
      }
    },

    connectWebSocket() {
      socket.connect();

      // Listen for new reports
      socket.on("new-report", (report) => {
        this.reports.unshift(report);
        this.showNotification("New Report", `${report.animalType} needs help!`);
      });

      // Listen for report updates
      socket.on("report-updated", (updatedReport) => {
        const index = this.reports.findIndex((r) => r.id === updatedReport.id);
        if (index !== -1) {
          this.reports.splice(index, 1, updatedReport);
        }
      });

      // Listen for deleted reports
      socket.on("report-deleted", (reportId) => {
        this.reports = this.reports.filter((r) => r.id !== reportId);
      });

      // Connection status
      socket.socket.on("connect", () => {
        this.isConnected = true;
      });

      socket.socket.on("disconnect", () => {
        this.isConnected = false;
      });

      socket.on("client-count", (count) => {
        this.activeUsers = count;
      });
    },

    setupGlobalFunctions() {
      // Allow map popup to call this function
      window.selectReport = (reportId) => {
        const report = this.reports.find((r) => r.id === reportId);
        if (report) this.selectReport(report);
      };
    },

    selectReport(report) {
      this.selectedReportId = report.id;
    },

    closeModal() {
      this.selectedReportId = null;
    },

    async acceptCase() {
      try {
        await api.updateReportStatus(
          this.selectedReportId,
          "in-progress",
          "Current User" // TODO: Replace with actual user name
        );
        alert("Case accepted successfully!");
      } catch (error) {
        console.error("Error accepting case:", error);
        alert("Failed to accept case");
      }
    },

    async resolveCase() {
      try {
        await api.updateReportStatus(
          this.selectedReportId,
          "resolved",
          "Current User"
        );
        alert("Case marked as resolved!");
        this.closeModal();
      } catch (error) {
        console.error("Error resolving case:", error);
        alert("Failed to resolve case");
      }
    },

    getCount(filterValue) {
      if (filterValue === "all") return this.reports.length;
      return this.reports.filter((r) => r.status === filterValue).length;
    },

    formatDateTime(date) {
      if (!date) return "Unknown";
      return new Date(date).toLocaleString("en-SG", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    },

    showNotification(title, message) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
          body: message,
          icon: "/favicon.ico",
        });
      }
    },
  },
};
</script>

<style scoped>
.rescuemapwrapper {
  display: grid;
}

.map-container {
  min-width: 30vh;
}

.sidebar {
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.header {
  padding: 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.header h1 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
}

.subtitle {
  margin: 0 0 16px;
  font-size: 14px;
  opacity: 0.9;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ef4444;
}

.status-dot.active {
  background: #22c55e;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.filters {
  padding: 16px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  overflow-x: auto;
}

.filter-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: white;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #e5e7eb;
}

.filter-btn.active {
  background: #10b981;
  color: white;
}

.reports-list {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
}

.map-container {
  min-height: 20vh;
  flex: 1;
  position: relative;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 32px;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #4b5563;
}

.modal h2 {
  margin: 0 0 8px;
  font-size: 24px;
  color: #1f2937;
}

.modal-address {
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 14px;
}

.modal-details {
  margin-bottom: 24px;
}

.detail-row {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.detail-row .label {
  font-weight: 600;
  color: #4b5563;
  min-width: 120px;
}

.detail-row .value {
  color: #1f2937;
  flex: 1;
}

.value.status,
.value.urgency {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
}

.value.status-pending {
  background: #fee2e2;
  color: #991b1b;
}

.value.status-in-progress {
  background: #fef3c7;
  color: #92400e;
}

.value.status-resolved {
  background: #d1fae5;
  color: #065f46;
}

.value.urgency-high {
  background: #fee2e2;
  color: #991b1b;
}

.value.urgency-medium {
  background: #fef3c7;
  color: #92400e;
}

.value.urgency-low {
  background: #d1fae5;
  color: #065f46;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-primary:hover {
  background: #059669;
}

.btn-success {
  background: #3b82f6;
  color: white;
}

.btn-success:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #e5e7eb;
  color: #4b5563;
}

.btn-secondary:hover {
  background: #d1d5db;
}
@media (min-width: 1024px) {
  .rescuemapwrapper {
    grid-template-columns: 1fr 1fr;
  };
}
</style>