<template>
  <!-- Left Sidebar -->
  <div class="rescuemapwrapper">
    <div class="sidebar">
      <!-- Header -->
      <div class="header">
        <p class="subtitle">
          {{ getCount(reports) }} reports pending... Accept a case now!
        </p>

        <!-- Connection Status -->
        <div class="connection-status">
          <span class="status-dot" :class="{ active: isConnected }"></span>
          <span>{{ isConnected ? "Online" : "Offline" }}</span>
          <span v-if="activeUsers > 0">({{ activeUsers }} active)</span>
        </div>
      </div>

      <!-- Reports List -->
      <div class="reports-list">
        <ReportCard
          v-for="report in reports"
          :key="report.id"
          :report="report"
          :selected="selectedReportId === report.id"
          @click="selectReport(report)"
          @acceptCase="acceptCaseFromCard"
        />

        <div v-if="reports?.length === 0" class="empty-state">
          <p>No reports found</p>
        </div>
      </div>
    </div>

    <!-- Right Side: Map -->
    <div class="map-container">
      <MapView :reports="reports" :center="mapCenter" />
    </div>
  </div>

  <!-- Report Details Modal TOD0 NOT APPEARING -->
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
      isConnected: false,
      activeUsers: 0,
      mapCenter: { lat: 1.3521, lng: 103.8198 }, // Singapore
    };
  },
  computed: {
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
        const filteredReports = response.filter(report => report.status === "pending");
        this.reports = filteredReports;
      } catch (error) {
        console.error("Error loading reports:", error);
        alert("Failed to load reports. Make sure backend is running!");
      }
    },

    connectWebSocket() {
      socket.connect();

      // Listen for new reports
      socket.on("new-report", (report) => {
        this.reports?.unshift(report);
        this.showNotification("New Report", `${report.animalType} needs help!`);
      });

      // Listen for report updates
      socket.on("report-updated", (updatedReport) => {
        const index = this.reports?.findIndex((r) => r.id === updatedReport.id);
        if (index !== -1) {
          this.reports?.splice(index, 1, updatedReport);
        }
      });

      // Listen for deleted reports
      socket.on("report-deleted", (reportId) => {
        this.reports = this.reports?.filter((r) => r.id !== reportId);
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
        const report = this.reports?.find((r) => r.id === reportId);
        if (report) this.selectReport(report);
        console.log("Case selected")
      };
    },

    async acceptCaseFromCard(report) {
      this.selectedReportId = report.id;
      this.selectReport(report);
      console.log('Case Accepted', report.id)
    },

    selectReport(report) {
      return this.reports?.find(r => r.id === this.selectedReportId);
    },

    closeModal() {
      this.selectedReportId = null;
    },

    async acceptCase() {
      try {
        // TODO: Show a form modal here to collect additional details from user
        // Details to collect:
        // - Estimated arrival time
        // - Resources needed
        // - Special equipment required
        // - Additional notes
        // - Team member assignments

        const confirmAccept = confirm(
          `Accept this case?\n\nAnimal: ${this.selectedReport.speciesName}\nLocation: ${this.selectedReport.location}\n\n(TODO: Replace this with a proper form modal)`
        );

        if (!confirmAccept) return;

        await api.updateReportStatus(
          this.selectedReportId,
          "in-progress",
          "Current User" // TODO: Replace with actual user name
        );

        // Remove from list since we're only showing pending
        this.reports = this.reports.filter(r => r.id !== this.selectedReportId);

        alert("Case accepted successfully!");
        this.closeModal();
      } catch (error) {
        console.error("Error accepting case:", error);
        alert("Failed to accept case");
      }
    },

    // async acceptCase() {
    //   try {
    //     await api.updateReportStatus(
    //       this.selectedReportId,
    //       "in-progress",
    //       "Current User" // TODO: Replace with actual user name
    //     );
    //     alert("Case accepted successfully!");
    //   } catch (error) {
    //     console.error("Error accepting case:", error);
    //     alert("Failed to accept case");
    //   }
    // },

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
      return this.reports?.length;
      // if (filterValue === "all") return this.reports?.length;
      // return this.reports?.filter((r) => r.status === filterValue).length;
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
  background: #046848;
  color: white;
  /* position: fixed; */
}

.header h1 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
}

.subtitle {
  margin: 0 0 16px;
  font-size: 22px;
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
    grid-template-columns: 2fr 3fr;
  }
}
</style>
