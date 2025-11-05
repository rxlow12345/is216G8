<template>
  <BackToTop />
  <!-- Notification -->
  <MapNotification
    ref="notify"
    :title="notificationData.title"
    :message="notificationData.message"
    :type="notificationData.type"
    :duration="notificationData.duration || 3000"
    @close="notificationData = {}"
  />
  <!-- Left Sidebar -->
  <div class="rescuemapwrapper">
    <div class="sidebar" :class="{ 'mobile-sheet': true, expanded: isSheetExpanded }">
      <div class="sheet-handle" @click="toggleSheet" title="Expand/collapse">
        <span class="sheet-grabber"></span>
      </div>
      <!-- Header -->
      <div class="header">
        <p class="subtitle">{{ getCount() }} Pending Reports</p>

        <!-- Connection Status -->
        <div class="connection-status">
          <span class="status-dot" :class="{ active: isConnected }"></span>
          <span>{{ isConnected ? "Online" : "Offline" }}</span>
          <span v-if="activeUsers > 0">({{ activeUsers }} Active)</span>
        </div>
      </div>

      <!-- Reports List -->
      <div class="filters">
        <div class="filter-group" role="group" aria-label="Urgency filter">
          <button
            type="button"
            class="filter-btn"
            :class="{ active: severityFilter === 'all' }"
            @click="severityFilter = 'all'"
          >All</button>
          <button
            type="button"
            class="filter-btn"
            :class="{ active: severityFilter === 'urgent' }"
            @click="severityFilter = 'urgent'"
          >Urgent</button>
          <button
            type="button"
            class="filter-btn"
            :class="{ active: severityFilter === 'moderate' }"
            @click="severityFilter = 'moderate'"
          >Moderate</button>
          <button
            type="button"
            class="filter-btn"
            :class="{ active: severityFilter === 'low' }"
            @click="severityFilter = 'low'"
          >Low</button>
        </div>
      </div>

      <div class="reports-list">
        <div v-if="loadingReports" class="empty-state">
          <p>Loading Reports...</p>
        </div>
        <div v-else-if="filteredReports?.length === 0" class="empty-state">
          <p>No reports found</p>
        </div>
        <ReportCard
          v-else
          v-for="report in filteredReports"
          :key="report.reportId"
          :report="report"
          :selected="selectedReportId === report.reportId"
          @click="selectReport"
          @acceptCase="acceptCaseFromCard"
        />
      </div>
    </div>

    <!-- Right Side: Map -->
    <div class="map-container">
      <MapView
        ref="mapView"
        :reports="filteredReports"
        :center="mapCenter"
        @acceptCase="acceptCaseFromCard"
      />
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
import reportApi from "../../src/api/reportApi";
import { db } from "../../src/firebase.js";
import { collection, addDoc, doc as fsDoc, updateDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { getCurrentUser } from "../../src/api/auth.js";
import socket from "../../src/api/socket";
import acceptCaseModal from "../../src/components/acceptCaseModal.vue";
import BackToTop from "../../src/components/BackToTop.vue";
import MapNotification from "../../src/components/MapNotification.vue";
import "../css/common.css"
import "../css/map.css"
// import { filter } from "mathjs";

export default {
  name: "RescueMap",
  components: {
    MapView,
    ReportCard,
    acceptCaseModal,
    BackToTop,
    MapNotification,
  },
  data() {
    return {
      loadingReports: true,
      reports: [],
      selectedReportId: null,
      selectedDocId: null,
      selectReportCoordinates: { lat: null, lng: null },
      isConnected: false,
      activeUsers: 0,
      mapCenter: { lat: 1.3521, lng: 103.8198 }, // Singapore
      showModal: false,
      selectedLocation: "",
      currentUser: "",
      severityFilter: "all",
      notificationData: { title: "", message: "", type: "info", duration: 6000 },
      
      isSheetExpanded: false,
    };
  },
  computed: {
    sheetStyles() {
      if (typeof window === 'undefined') return {};
      if (window.innerWidth > 768) return {};
      const h = this.isSheetExpanded ? '70vh' : '120px';
      return { height: h };
    },
  },
  async mounted() {
    // Connect socket immediately; do not block on data/geocoding
    this.connectWebSocket();
    // Load reports in parallel to avoid delaying socket handshake
    await this.loadReports();
    this.setupGlobalFunctions();
  },
  // Disconnect only when navigating away from this route (not on HMR unmount)
  // async unmounted(to, from, next) {
  async unmounted() {
    socket.disconnect();
    // next;
  },
  methods: {
    toggleSheet() { this.isSheetExpanded = !this.isSheetExpanded; },
    showNotification(title = "", message = "", type = "info", duration = 6000) {
      this.notificationData = { title, message, type, duration };
      this.$nextTick(() => this.$refs.notify?.show());
    },
    async selectReport(report) {
      if (!report) return;
      this.selectedReportId = report.reportId;
      this.selectedDocId = report.id;
      // Immediately open the popup and pan to it for better UX
      const opened = await this.$refs.mapView?.openMarkerPopup(report.reportId, report);
      if (!opened) {
        // Retry on next tick in case markers are rebuilding
        await this.$nextTick();
        this.$refs.mapView?.openMarkerPopup(report.reportId, report);
      }
    },
    async ensureMapViewReady() {
      if (this.$refs.mapView) return true;
      await this.$nextTick();
      return !!this.$refs.mapView;
    },
    handleReportSelection() {
      const report = this.selectedReport;
      if (!report) {
        return;
      }

      // to emit event to the map view to ensure the pop up opens
      this.$refs.mapView?.openMarkerPopup(report.reportId);

      // Let popup autoPan handle map movement to keep fully in view
    },
    getCount() {
      if (!Array.isArray(this.reports)) return 0;
      return this.reports.filter((r) => {
        const statusOk = (r?.status || "").toLowerCase().trim() === "pending";
        return statusOk && this.isWithinSingapore(r?.coordinates);
      }).length;
    },
    connectWebSocket() {
      socket.connect();

      // Listen for new reports
      socket.on("new-report", async (report) => {
        try {
          // Geocode incoming report before adding so markers can render
          const addressToGeocode =
            typeof report.location === "object"
              ? report.location.address ||
                report.location.postalCode ||
                "Singapore"
              : report.location || "Singapore";

          const coords = await this.geocode(addressToGeocode);
          if (this.isWithinSingapore(coords)) {
            report.coordinates = coords;
          } else {
            report.coordinates = this.mapCenter; // safe fallback
          }
        } catch (err) {
          console.warn(
            "Failed to geocode incoming report; using fallback",
            err?.message
          );
          report.coordinates = this.mapCenter;
        }

        // Drop a visual pin immediately (non-persistent) so user sees it instantly
        try {
          const ready = await this.ensureMapViewReady();
          if (ready) {
            console.debug("new-report addPin", report.coordinates);
            await this.$refs.mapView.addPin(report.coordinates, {
              popupContent: `<b>${report.speciesName || "New Case"}</b>`,
              persistent: false,
            });
          }
        } catch (e) {
          console.warn("addPin failed", e?.message);
        }

        // Only add valid pending reports and normalize minimal fields
        const status = (report?.status || "").toLowerCase().trim();
        if (status === "pending") {
          report.speciesName = report.speciesName || report.animalType || "Unknown";
          const ts = report.createdAt;
          if (!ts) {
            report.createdAt = { _seconds: Math.floor(Date.now() / 1000) };
          } else if (typeof ts === "string" || typeof ts === "number") {
            const date = new Date(ts);
            if (!isNaN(date)) report.createdAt = { _seconds: Math.floor(date.getTime() / 1000) };
          } else if (ts instanceof Date) {
            report.createdAt = { _seconds: Math.floor(ts.getTime() / 1000) };
          }

          // Then update reactive list so MapView rebuilds persistent markers
          this.reports?.unshift(report);
          // Notify about new report
          const species = report?.speciesName || report?.animalType || "An animal";
          this.showNotification("New Report", `${species} needs help!`, "info", 7000);
        }
        // Recenter so the new marker is visible
        this.$nextTick(() => this.$refs.mapView?.recenterMap());
      });

      // Listen for report updates
      socket.on("report-updated", async (updatedReport) => {
        const index = this.reports?.findIndex((r) => r.id === updatedReport.id);
        if (index !== -1) {
          // Ensure updated report still has coordinates
          if (!updatedReport.coordinates) {
            try {
              const addressToGeocode =
                typeof updatedReport.location === "object"
                  ? updatedReport.location.address ||
                    updatedReport.location.postalCode ||
                    "Singapore"
                  : updatedReport.location || "Singapore";
              const coords = await this.geocode(addressToGeocode);
              updatedReport.coordinates = this.isWithinSingapore(coords)
                ? coords
                : this.mapCenter;
            } catch (e) {
              updatedReport.coordinates = this.mapCenter;
            }
          }

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
        const report = this.reports?.find((r) => r.reportId === reportId);
        if (report) this.selectedReportId = report.reportId;
        console.log("Case selected");
      };
      // Quick manual test helper to drop a pin
      window.dropPin = (lat, lng) =>
        this.$refs.mapView?.addPin(
          { lat, lng },
          { popupContent: "<b>Test Pin</b>", persistent: false }
        );
    },
    isWithinSingapore(coordinates) {
      if (
        !coordinates ||
        typeof coordinates.lat !== "number" ||
        typeof coordinates.lng !== "number"
      ) {
        return false;
      }

      // Singapore's approximate bounding box
      const SINGAPORE_BOUNDS = {
        north: 1.4707,
        south: 1.1496,
        east: 104.0945,
        west: 103.6057,
      };

      const { lat, lng } = coordinates;

      return (
        lat >= SINGAPORE_BOUNDS.south &&
        lat <= SINGAPORE_BOUNDS.north &&
        lng >= SINGAPORE_BOUNDS.west &&
        lng <= SINGAPORE_BOUNDS.east
      );
    },
    async loadReports() {
      try {
        const response = await reportApi.getAllReports();
        const filteredReports = response.filter(
          (report) => report.status === "pending"
        );

        this.reports = [];

        for (const report of filteredReports) {
          if (report.location == null) {
            report.location = "Singapore Management University";
          }
          try {
            // Prefer full address, then postal code, then fallback
            const addressToGeocode =
              typeof report.location === "object"
                ? report.location.address ||
                  report.location.postalCode ||
                  "Singapore"
                : report.location;

            const coordinates = await this.geocode(addressToGeocode);

            if (this.isWithinSingapore(coordinates)) {
              report.coordinates = coordinates;
              this.reports.push(report); // report only added if in SG
              this.loadingReports = false;
            }
          } catch (geocodeError) {
            console.log(
              `Report ID ${report.reportId} failed to geocode location`,
              geocodeError.message
            );
            report.coordinates = this.mapCenter;
            // Ensure we still render a fallback marker
            this.reports.push(report);
            // break;
          }
          // to handle geocoding errors
        }
        this.loadingReports = false;
        // Ensure map view fits markers after first load
        this.$nextTick(() => this.$refs.mapView?.recenterMap());
        console.log("All Reports Fetched");
        // this.reports = validReports;
        // console.log(
        //   `Only loaded ${validReports.length} valid reports out of ${filteredReports.length} total`
        // );
        console.log("Reports:", this.reports);
      } catch (error) {
        console.error("Error loading reports:", error.message);
        this.showNotification(
          "Failed to Load Reports",
          "Make sure the backend is running and try again.",
          "error",
        );
      }
    },
    async geocode(address) {
      const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
      const OPENCAGE_BASE_URL = "https://api.opencagedata.com/geocode/v1/json";
      const url = `${OPENCAGE_BASE_URL}?q=${encodeURIComponent(
        address
      )}&key=${OPENCAGE_API_KEY}&limit=1&countrycode=sg`;
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `OpenCage API request failed with status: ${response.status}`
          );
        }

        const data = await response.json();

        if (
          !data.results ||
          data.results.length == 0 ||
          !data.results[0].geometry
        ) {
          throw new Error("Geocoding service returned no valid results");
        }

        const lat = data.results[0].geometry.lat;
        const lng = data.results[0].geometry.lng;
        console.log("Geocode ran successfully");
        return { lat: lat, lng: lng };
      } catch (error) {
        console.error("Geocoding Error:", error);
        throw new Error("Failed to connect to the geocoding service.");
      }
    },
    async acceptCaseFromCard(report) {
      this.selectedReportId = report.reportId;
      this.selectedDocId = report.id;
      if (typeof report.location === "object") {
        this.selectedLocation = report.location.address; // Display address to user
      } else {
        this.selectedLocation = report.location;
      }
      this.selectReport;

      try {
        const addressToGeocode =
          typeof report.location === "object"
            ? report.location.address ||
              report.location.postalCode ||
              "Singapore"
            : report.location;

        this.selectReportCoordinates = await this.geocode(addressToGeocode);
      } catch (error) {
        console.error("Failed to geocode location on case acceptance:", error);
        this.selectReportCoordinates = this.mapCenter;
      }

      this.showModal = true;
      console.log("coordinates", this.selectReportCoordinates);
      console.log("Case Accepted", this.selectedReportId);
    },

    async handleConfirmation(payload) {
      const minutes = Number(payload?.minutes)
      const now = new Date()
      const arrivalJs = new Date(now.getTime() + (Number.isFinite(minutes) ? minutes : 0) * 60000)
      const firebaseTimestamp = Timestamp.fromDate(arrivalJs)
      const caseAcceptedTimeJS = new Date();
      const caseAcceptedTime = caseAcceptedTimeJS.toISOString();
      const docIdtoUpdate = this.selectedDocId;
      const reportIdtoUpload = this.selectedReportId;

      try {
        const uid = await this.updateVolunteer();
        const updates = {
          timeAccepted: caseAcceptedTime,
          volunteerETA: arrivalJs.toISOString(),
          estimatedDurationMinutes: minutes,
          uid: uid,
        };

        // 1) Update incidentReports document in Firestore
        if (docIdtoUpdate) {
          await updateDoc(fsDoc(db, 'incidentReports', docIdtoUpdate), {
            status: 'active',
            assignedVolunteerID: uid,
            timeAccepted: serverTimestamp(),
          });
        }

        // Also sync via API (kept for compatibility)
        try {
          await reportApi.updateReportFields(docIdtoUpdate, updates);
          await this.updateReportStatus(docIdtoUpdate);
        } catch (_) { /* ignore api sync errors */ }

        // 2) Create activeStatusSummary document with required structure
        await addDoc(collection(db, 'activeStatusSummary'), {
          // Basic info
          reportId: reportIdtoUpload,
          volunteerID: uid,

          // Timestamps
          acceptedAt: Timestamp.now(),
          lastUpdated: Timestamp.now(),
          volunteerETA: firebaseTimestamp,
          estimatedDurationMinutes: minutes,

          // Progress
          progressPercentage: 0,

          // Checkpoints - ALL 4 must be included, all initialized to false
          checkpoints: {
            arrived: {
              completed: false,
              completedAt: null,
              notes: "",
            },
            handled: {
              completed: false,
              completedAt: null,
              condition: "",
              notes: "",
            },
            treated: {
              completed: false,
              completedAt: null,
              diagnosis: "",
              treatment: "",
              notes: "",
            },
            reconciled: {
              completed: false,
              completedAt: null,
              outcome: "",
              notes: "",
            },
          },
        });

        // Close modal and redirect to Active Reports with case pre-open
        this.handleModalClose();
        this.$router.push({ path: '/volunteer/active', query: { caseId: reportIdtoUpload } });
      } catch (error) {
        console.error("Error accepting case:", error);
        this.showNotification(
          "Failed to Accept Case",
          "There was an error accepting the case. Please try again.",
          "error",
        );
      }
    },

    handleModalClose() {
      this.showModal = false;
      this.selectedReportId = null;
      this.selectedDocId = null;
      this.selectReportCoordinates = { lat: null, lng: null };
      this.selectedLocation = "";
      console.log("Modal closed - report deselected");
    },

    async updateReportStatus(docIdtoUpdate) {
      if (!docIdtoUpdate) {
        throw new Error("No report ID selected");
      }
      try {
        console.log("Attempting to update status for docId:", docIdtoUpdate);

        const response = await reportApi.updateReportStatus(
          docIdtoUpdate,
          "active"
        );
        console.log("Status updated successfully, new status:", response);

        return response;
      } catch (e) {
        console.error("Failed to update status:", e);
        console.error("Error message:", e, message);
        console.error("Error response", e.response?.data);
        throw e; // so handleconfirmation catches it
      }
    },

    async updateVolunteer() {
      try {
        const result = await getCurrentUser();
        return result.uid;
      } catch (e) {
        console.log("Error getting user", e);
        this.showNotification("Current user not found", "Please log in again.", "warning");
      }
    },

    // showNotification(title = "", message) {
    //   if ("Notification" in window && Notification.permission === "granted") {
    //     new Notification(title, {
    //       body: message,
    //       icon: "/favicon.ico",
    //     });
    //   }
    // },
  },
  computed: {
    selectedReport() {
      return this.reports?.find((r) => r.reportId === this.selectedReportId);
    },
    filteredReports() {
      const list = Array.isArray(this.reports) ? this.reports : [];
      const f = (this.severityFilter || "all").toLowerCase();
      if (f === "all") return list;
      if (f === "low") {
        return list.filter((r) => {
          const sev = (r?.severity || "").toLowerCase();
          return sev !== "urgent" && sev !== "moderate";
        });
      }
      return list.filter((r) => (r?.severity || "").toLowerCase() === f);
    },
  },
  watch: {
    selectedReportId: {
      handler(newId, oldId) {
        if (newId !== oldId && newId) {
          this.handleReportSelection();
        }
      },
      immediate: true, // Run the handler immediately when the component is mounted
    },
  },
};
</script>

<style scoped>
</style>