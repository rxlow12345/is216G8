<template>
  <BackToTop/>
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
          :key="report.reportId"
          :report="report"
          :selected="selectedReportId === report.reportId"
          @click="selectReport"
          @acceptCase="acceptCaseFromCard"
        />

        <div v-if="reports?.length === 0" class="empty-state">
          <p>No reports found</p>
        </div>
      </div>
    </div>

    <!-- Right Side: Map -->
    <div class="map-container">
      <MapView :reports="reports" :center="mapCenter" @acceptCase="acceptCaseFromCard" />
    </div>

    <!-- PopUp -->
      <acceptCaseModal
        :isPopup="showModal"
        :location="selectedLocation"
        :reportId="selectedReportId"
        @close="handleModalClose"
        @confirm="handleConfirmation"

      />
  </div>

</template>

<script>
import MapView from "../../src/components/MapView.vue";
import ReportCard from "../../src/components/ReportCard.vue";
import api from "../../src/api/mapapi";
import reportApi from "../../src/api/reportApi";
import socket from "../../src/api/socket";
import { map } from "leaflet";
import acceptCaseModal from "../../src/components/acceptCaseModal.vue";
import BackToTop from "../../src/components/BackToTop.vue";


export default {
  name: "RescueMap",
  components: {
    MapView,
    ReportCard,
    acceptCaseModal,
    BackToTop
  },
  data() {
    return {
      reports: [],
      selectedReportId: null,
      selectedDocId: null,
      selectReportCoordinates: { lat: null, lng: null },
      isConnected: false,
      activeUsers: 0,
      mapCenter: { lat: 1.3521, lng: 103.8198 }, // Singapore
      showModal: false,
      selectedLocation: "",
    };
  },
  computed: {},
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
        const response = await reportApi.getAllReports();
        const filteredReports = response.filter(
          (report) => report.status === "pending"
        );

        for (const report of filteredReports) {
          if (report.location == null) {
            report.location = "Singapore Management University";
          } 
          if (typeof report.location === 'object'){
            // means postal code present 
            const location = report.location.postalCode
          } else {
            const location = report.location.address
          }
          // to handle geocoding errors
          try {
            const coordinates = await this.geocode(report.location);
            report.coordinates = coordinates;
          } catch (geocodeError) {
            console.log(
              `Report ID ${report.reportId} failed to geocode location`,
              geocodeError.message
            );
            report.coordinates = this.mapCenter;
          }
        }
        this.reports = filteredReports;
        console.log('Reports:', this.reports);
      } catch (error) {
        console.error("Error loading reports:", error.message);
        alert("Failed to load reports. Make sure backend is running!");
      }
    },

    // async geocode(address) {
    //   const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
    //   const OPENCAGE_BASE_URL = "https://api.opencagedata.com/geocode/v1/json";
    //   const url = `${OPENCAGE_BASE_URL}?q=${address}&key=${OPENCAGE_API_KEY}`;

    //   try {
    //     const response = await fetch(url);

    //     if (!response.ok) {
    //       throw new Error(
    //         `OpenCage API request failed with status: ${response.status}`
    //       );
    //     }

    //     const data = await response.json();

    //     if (
    //       !data.results ||
    //       data.results.length == 0 ||
    //       !data.results[0].geometry
    //     ) {
    //       throw new Error("Geocoding service returned no valid results");
    //     }

    //     const lat = data.results[0].geometry.lat;
    //     const lng = data.results[0].geometry.lng;
    //     return { lat: lat, lng: lng };
    //   } catch (error) {
    //     console.error("Geocoding Error:", error);
    //     throw new Error("Failed to connect to the geocoding service.");
    //   }
    // },

    async acceptCaseFromCard(report) {
      this.selectedReportId = report.reportId;
      this.selectedDocId = report.id;
      if (typeof report.location === 'object'){
        this.selectedLocation = report.location.address;
      } else {
        this.selectedLocation = report.location;
      }
      this.selectReport;

      try {
        this.selectReportCoordinates = await this.geocode(report.location);
      } catch (error) {
        console.error("Failed to geocode location on case acceptance:", error);
        this.selectReportCoordinates = this.mapCenter;
      }
      
      this.showModal = true;
      console.log("coordinates", this.selectReportCoordinates);
      console.log("Case Accepted", this.selectedReportId);
    },

    handleModalClose() {
      this.showModal = false;
      this.selectedReportId = null;
      this.selectedDocId = null;
      this.selectReportCoordinates = { lat: null, lng: null };
      this.selectedLocation = "";
      console.log("Modal closed - report deselected");
    },

    async updateReportStatus(docIdtoUpdate){
      if (!docIdtoUpdate) {
        throw new Error("No report ID selected");
      }
      try {
        console.log('Attempting to update status for docId:', docIdtoUpdate);

        const response = await reportApi.updateReportStatus(docIdtoUpdate, 'active')
        console.log('Status updated successfully, new status:', response);

        return response
          
        } catch (e) {
          console.error('Failed to update status:', e);
          console.error('Error message:', e,message);
          console.error('Error response', e.response?.data);
          throw e; // so handleconfirmation catches it 
        }
    },

    async handleConfirmation(etaData) {
      // console.log('selected report id',this.selectedReportId);
      // adjusting data 
      const firebaseTimestamp = etaData[0].timestamp;
      console.log('timestamp', firebaseTimestamp);
      const caseAcceptedTimeJS = new Date();
      const caseAcceptedTime = caseAcceptedTimeJS.toISOString() ;

      const updates = {
        timeAccepted: caseAcceptedTime, 
        volunteerETA: firebaseTimestamp
      }
      
      console.log('documentid', this.selectedDocId);
      const docIdtoUpdate = this.selectedDocId;

      try {
        //  to update report fields 
        const result = await reportApi.updateReportFields(docIdtoUpdate, updates)
        console.log('Case accepted!',result);

        await this.updateReportStatus(docIdtoUpdate);
        
        // Close modal and reset selection
        this.handleModalClose()
        // Reload reports to update the list
        await this.loadReports();

        alert('Case accepted successfully')
      } catch (error) {
        console.error("Error accepting case:", error);
        alert("Failed to accept case");
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
        console.log("Case selected");
      };
    },

    getCount(filterValue) {
      return this.reports?.length;
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
  computed: {
    selectReport() {
      return this.reports?.find((r) => r.id === this.selectedReportId);
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
  background: #046848;
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
