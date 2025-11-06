<template>
  <BackToTop />
  
  <!-- Left Sidebar -->
  <div class="rescuemapwrapper" :class="{ 'sidebar-expanded': isSheetExpanded }">
    <div 
      class="sidebar" 
      :class="{ 
        'mobile-sheet': true, 
        expanded: isSheetExpanded,
        'is-dragging': isDragging
      }"
      :style="drawerStyle"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div 
        class="sheet-handle" 
        @click="toggleSheet" 
        @touchstart.stop="handleDragStart"
        @touchmove.stop="handleDragMove"
        @touchend.stop="handleDragEnd"
        title="Expand/collapse"
      >
        <span class="sheet-grabber"></span>
      </div>
      <!-- Reports Banner (matches deployed style) -->
      <div class="reports-banner">
        <h2 class="reports-banner-title">Accept Reports</h2>
        <p class="reports-banner-subtitle">{{ animatedPendingCount }} pending reports</p>
        <div class="reports-banner-status">
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
      <!-- Loading overlay for markers -->
      <div v-if="isLoadingMarkers" class="map-loading-overlay">
        <div class="map-loading-spinner"></div>
        <p class="map-loading-text">Loading rescue locations...</p>
      </div>
      <MapView
        ref="mapView"
        :reports="filteredReports"
        :center="mapCenter"
        :isLoadingMarkers="isLoadingMarkers"
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
import Spinner from "../../src/components/Spinner.vue";
import reportApi from "../../src/api/reportApi";
import { db } from "../../src/firebase.js";
import { collection, addDoc, doc as fsDoc, updateDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { getCurrentUser } from "../../src/api/auth.js";
import socket from "../../src/api/socket";
import acceptCaseModal from "../../src/components/acceptCaseModal.vue";
import BackToTop from "../../src/components/BackToTop.vue";
import "../css/common.css"
import "../css/map.css"
// import { filter } from "mathjs";

export default {
  name: "RescueMap",
  components: {
    MapView,
    ReportCard,
    Spinner,
    acceptCaseModal,
    BackToTop,
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
      countUpdating: false,
      countUpdateTimer: null,
      
      isSheetExpanded: false,
      // Animated counter for pending reports
      animatedPendingCount: 0,
      // Loading state for map markers
      isLoadingMarkers: false,
      // Drawer drag state
      isDragging: false,
      dragStartY: 0,
      dragCurrentY: 0,
      drawerHeight: 0, // Dynamic height during drag
      drawerStartHeight: 0,
      _pendingNavigation: null, // Store pending navigation after accept
    };
  },
  computed: {
    sheetStyles() {
      if (typeof window === 'undefined') return {};
      if (window.innerWidth > 768) return {};
      const h = this.isSheetExpanded ? '70vh' : '120px';
      return { height: h };
    },
    drawerStyle() {
      if (typeof window === 'undefined' || window.innerWidth > 768) return {};
      
      // If dragging, use dynamic height
      if (this.isDragging && this.drawerHeight > 0) {
        return {
          height: `${this.drawerHeight}px`,
          transform: `translateY(${this.dragCurrentY}px)`,
          transition: 'none'
        };
      }
      
      // Normal state - controlled by CSS and expanded class
      return {
        height: this.isSheetExpanded ? '70vh' : '180px',
        transform: 'translateY(0)',
        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      };
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
    // Clean up drag state
    if (this.isDragging) {
      document.body.style.overflow = '';
    }
    // next;
    if (this.countUpdateTimer) {
      clearTimeout(this.countUpdateTimer);
      this.countUpdateTimer = null;
    }
  },
  methods: {
    toggleSheet() { 
      this.isSheetExpanded = !this.isSheetExpanded;
    },
    // Touch handlers for drawer dragging
    handleTouchStart(e) {
      // Only allow dragging from the handle area when collapsed
      if (!this.isSheetExpanded) {
        const touch = e.touches[0];
        if (touch.clientY > window.innerHeight - 200) {
          this.handleDragStart(e);
        }
      }
    },
    handleTouchMove(e) {
      if (this.isDragging) {
        this.handleDragMove(e);
      }
    },
    handleTouchEnd(e) {
      if (this.isDragging) {
        this.handleDragEnd(e);
      }
    },
    handleDragStart(e) {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches ? e.touches[0] : e;
      this.isDragging = true;
      this.dragStartY = touch.clientY;
      this.drawerStartHeight = this.isSheetExpanded ? window.innerHeight * 0.7 : 180;
      this.drawerHeight = this.drawerStartHeight;
      // Prevent body scroll during drag
      document.body.style.overflow = 'hidden';
    },
    handleDragMove(e) {
      if (!this.isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches ? e.touches[0] : e;
      const deltaY = this.dragStartY - touch.clientY; // Positive = dragging up
      
      // Calculate new height
      let newHeight = this.drawerStartHeight + deltaY;
      
      // Constrain height between min (180px) and max (70vh)
      const minHeight = 180;
      const maxHeight = window.innerHeight * 0.7;
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      
      this.drawerHeight = newHeight;
      this.dragCurrentY = 0; // Don't translate, just resize
    },
    handleDragEnd(e) {
      if (!this.isDragging) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      // Restore body scroll
      document.body.style.overflow = '';
      
      const touch = e.changedTouches ? e.changedTouches[0] : e;
      const totalDelta = this.drawerHeight - this.drawerStartHeight;
      
      // Determine if should expand or collapse based on drag distance
      const threshold = 50; // Minimum drag distance to trigger state change
      const midPoint = (180 + window.innerHeight * 0.7) / 2;
      
      if (Math.abs(totalDelta) > threshold) {
        // User dragged significantly
        this.isSheetExpanded = totalDelta > 0; // Dragged up = expand
      } else {
        // Small drag, toggle based on current position
        this.isSheetExpanded = this.drawerHeight > midPoint;
      }
      
      // Reset drag state
      this.isDragging = false;
      this.dragStartY = 0;
      this.dragCurrentY = 0;
      this.drawerHeight = 0;
      this.drawerStartHeight = 0;
    },
    pulseCountSpinner(duration = 600) {
      this.countUpdating = true;
      if (this.countUpdateTimer) clearTimeout(this.countUpdateTimer);
      this.countUpdateTimer = setTimeout(() => {
        this.countUpdating = false;
        this.countUpdateTimer = null;
      }, duration);
    },
    animatePendingCount(target) {
      if (typeof target !== 'number' || isNaN(target)) return;
      const start = this.animatedPendingCount || 0;
      const change = target - start;
      // Shorter duration for single increments, longer for large jumps
      const duration = Math.abs(change) === 1 ? 300 : 700; // ms
      const startTime = performance.now();

      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        this.animatedPendingCount = Math.max(0, Math.round(start + change * eased));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    },
    // Increment counter by 1 (for real-time updates during geocoding)
    incrementPendingCount() {
      const current = this.animatedPendingCount || 0;
      this.animatePendingCount(current + 1);
    },
    isDisplayable(report) {
      if (!report) return false;
      const statusOk = (report?.status || "").toLowerCase().trim() === "pending";
      const hasBasics =
        !!(report?.speciesName || report?.animalType) &&
        !!report?.severity &&
        !!report?.incidentType;
      const coords = report?.coordinates;
      const coordsOk =
        coords &&
        typeof coords.lat === "number" &&
        typeof coords.lng === "number" &&
        this.isWithinSingapore(coords);
      return statusOk && hasBasics && coordsOk;
    },
    async selectReport(report) {
      if (!report) return;
      this.selectedReportId = report.reportId;
      this.selectedDocId = report.id;
      // Open the popup but don't pan to it (shouldPan = false) to respect user's map position
      const opened = await this.$refs.mapView?.openMarkerPopup(report.reportId, report, false);
      if (!opened) {
        // Retry on next tick in case markers are rebuilding
        await this.$nextTick();
        this.$refs.mapView?.openMarkerPopup(report.reportId, report, false);
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

      // Open popup without panning to respect user's map position
      this.$refs.mapView?.openMarkerPopup(report.reportId, null, false);
    },
    getCount() {
      if (!Array.isArray(this.reports)) return 0;
      return this.reports.filter((r) => this.isDisplayable(r)).length;
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
          const beforeCount = this.getCount();
          this.reports?.unshift(report);
          if (this.getCount() !== beforeCount) this.pulseCountSpinner();
          // Notify about new report
          // Optional: could trigger a subtle UI pulse instead of a toast
        }
        // Don't auto-recenter - let user decide where to view the map
        // The new marker will appear but won't force map movement
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

          const wasDisplayable = this.isDisplayable(this.reports?.[index]);
          const nowDisplayable = this.isDisplayable(updatedReport);
          if (nowDisplayable) {
            this.reports?.splice(index, 1, updatedReport);
            if (!wasDisplayable) this.pulseCountSpinner();
          } else if (wasDisplayable) {
            this.reports?.splice(index, 1);
            this.pulseCountSpinner();
          } else {
            this.reports?.splice(index, 1);
          }
        }
      });

      // Listen for deleted reports
      socket.on("report-deleted", (reportId) => {
        const beforeCount = this.getCount();
        this.reports = this.reports?.filter((r) => r.id !== reportId);
        if (this.getCount() !== beforeCount) this.pulseCountSpinner();
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
      this.isLoadingMarkers = true;
      try {
        const response = await reportApi.getAllReports();
        const filteredReports = response.filter(
          (report) => report.status === "pending"
        );

        console.log(`Total pending reports from API: ${filteredReports.length}`);

        // Initialize counter to 0 for visible 0→N animation
        this.animatedPendingCount = 0;

        // Build reports array without triggering reactivity on each push
        const reportsToAdd = [];
        let processedCount = 0;
        let addedCount = 0;
        let skippedCount = 0;

        for (const report of filteredReports) {
          if (report.location == null) {
            report.location = "Singapore Management University";
          }
          try {
            const addressToGeocode =
              typeof report.location === "object"
                ? report.location.address ||
                  report.location.postalCode ||
                  "Singapore"
                : report.location;

            const coordinates = await this.geocode(addressToGeocode);
            processedCount++;

            if (this.isWithinSingapore(coordinates)) {
              report.coordinates = coordinates;
              reportsToAdd.push(report);
              addedCount++;

              // Increment counter only if report will be displayable
              if (this.isDisplayable(report)) {
                this.incrementPendingCount();
              }

              console.debug(`Added report ${report.reportId} at ${coordinates.lat}, ${coordinates.lng}`);
            } else {
              console.warn(`Report ${report.reportId} coordinates outside Singapore bounds, using fallback`);
              report.coordinates = this.mapCenter;
              reportsToAdd.push(report);
              addedCount++;

              // Increment counter only if report will be displayable
              if (this.isDisplayable(report)) {
                this.incrementPendingCount();
              }
            }
          } catch (geocodeError) {
            console.log(
              `Report ID ${report.reportId} failed to geocode location`,
              geocodeError.message
            );
            report.coordinates = this.mapCenter;
            reportsToAdd.push(report);
            addedCount++;

            // Increment counter only if report will be displayable
            if (this.isDisplayable(report)) {
              this.incrementPendingCount();
            }
          }
        }

        // FINAL UPDATE - Ensure all reports are added and markers render
        this.reports = reportsToAdd;
        await this.$nextTick();

        // Reconcile animated counter with actual displayable count
        const actualDisplayableCount = this.getCount();
        if (this.animatedPendingCount !== actualDisplayableCount) {
          console.warn(`Counter mismatch! Animated: ${this.animatedPendingCount}, Actual: ${actualDisplayableCount}`)
          this.animatePendingCount(actualDisplayableCount);
        }

        skippedCount = filteredReports.length - processedCount;
        this.loadingReports = false;

        console.log(`All Reports Fetched: ${addedCount} added, ${skippedCount} skipped out of ${filteredReports.length} total`);
        console.log(`Reports array length: ${this.reports.length}`);

        // Check which reports have valid coordinates
        const reportsWithCoords = this.reports.filter(r => r.coordinates && r.coordinates.lat && r.coordinates.lng);
        const reportsWithoutCoords = this.reports.filter(r => !r.coordinates || !r.coordinates.lat || !r.coordinates.lng);

        console.error('📊 Reports Analysis:', {
          total: this.reports.length,
          withCoords: reportsWithCoords.length,
          withoutCoords: reportsWithoutCoords.length,
          reportsWithCoords: reportsWithCoords.map(r => ({
            id: r.reportId || r.id,
            coords: r.coordinates
          })),
          reportsWithoutCoords: reportsWithoutCoords.map(r => ({
            id: r.reportId || r.id,
            location: r.location
          }))
        });

        // Final marker update to ensure everything renders
        if (this.$refs.mapView?.updateMarkers) {
          console.error('✅ Final updateMarkers call');
          this.$refs.mapView.updateMarkers();
        }
      } catch (error) {
        console.error("Error loading reports:", error.message);
      } finally {
        this.isLoadingMarkers = false;
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
            volunteerETA: arrivalJs.toISOString(),
            estimatedDurationMinutes: minutes,
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

        // Don't close modal yet - let it show success state
        // The modal will handle navigation when user clicks the link
        // If user closes without clicking, we'll handle navigation on close
        this._pendingNavigation = {
          path: '/volunteer/active',
          query: { caseId: reportIdtoUpload }
        };
      } catch (error) {
        console.error("Error accepting case:", error);
      }
    },

    handleModalClose() {
      this.showModal = false;
      // If there's pending navigation and user didn't click the link, navigate now
      if (this._pendingNavigation) {
        this.$router.push(this._pendingNavigation);
        this._pendingNavigation = null;
      }
      this.selectedReportId = null;
      this.selectedDocId = null;
      this.selectReportCoordinates = { lat: null, lng: null };
      this.selectedLocation = "";
      console.log("Modal closed - report deselected");
    },
    
    handleOpenRescueStages(reportId) {
      // Navigate to Active Reports with caseId to open the modal
      this.$router.push({ 
        path: '/volunteer/active', 
        query: { caseId: reportId || this.selectedReportId } 
      });
      // Clear pending navigation since we're navigating now
      this._pendingNavigation = null;
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
    isCountLoading() {
      return this.loadingReports || this.countUpdating;
    },
    filteredReports() {
      const list = Array.isArray(this.reports) ? this.reports : [];
      const base = list.filter((r) => this.isDisplayable(r));
      const f = (this.severityFilter || "all").toLowerCase();
      let filtered;
      if (f === "all") {
        // Return base (displayable reports) not list (all reports)
        filtered = base;
      } else if (f === "low") {
        // Filter from base to ensure only displayable reports
        filtered = base.filter((r) => {
          const sev = (r?.severity || "").toLowerCase();
          return sev !== "urgent" && sev !== "moderate";
        });
      } else {
        // Filter from base to ensure only displayable reports
        filtered = base.filter((r) => (r?.severity || "").toLowerCase() === f);
      }
      
      // Debug logging
      console.error('🔍 filteredReports computed:', {
        originalCount: list.length,
        displayableCount: base.length,
        filteredCount: filtered.length,
        filter: f,
        reports: filtered.map(r => ({
          id: r.reportId || r.id,
          hasCoords: !!r.coordinates,
          coords: r.coordinates
        }))
      });
      
      return filtered;
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
    // Animate counter whenever the list of reports changes (for socket updates)
    reports: {
      handler() {
        const target = this.getCount();
        // Only animate if there's a significant change (e.g., from socket updates)
        // Real-time increments during loadReports are handled by incrementPendingCount()
        if (Math.abs(target - this.animatedPendingCount) > 1) {
          this.animatePendingCount(target);
        }
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.pending-count {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pending-count .subtitle {
  margin: 0;
}
</style>

<style>
/* Reports Banner styles - keeping in component to prevent merge conflicts */
/* Using !important to ensure these override any conflicting styles */
.sidebar .reports-banner,
.reports-banner {
  background: #2d5016 !important;
  color: #FFFFFF !important;
  padding: 24px 20px !important;
  width: 100% !important;
  box-sizing: border-box !important;
  flex-shrink: 0 !important;
  font-family: Georgia, 'Times New Roman', Times, serif !important;
}

.sidebar .reports-banner-title,
.reports-banner-title {
  margin: 0 0 8px 0 !important;
  font-size: 2rem !important;
  font-weight: 700 !important;
  color: #FFFFFF !important;
  line-height: 1.2 !important;
  letter-spacing: -0.5px !important;
}

.sidebar .reports-banner-subtitle,
.reports-banner-subtitle {
  margin: 0 0 8px 0 !important;
  font-size: 1.1rem !important;
  font-weight: 400 !important;
  color: rgba(255, 255, 255, 0.9) !important;
  line-height: 1.4 !important;
}

.sidebar .reports-banner-status,
.reports-banner-status {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin-top: 8px !important;
  font-size: 0.9rem !important;
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 400 !important;
}

.sidebar .reports-banner-status .status-dot,
.reports-banner-status .status-dot {
  width: 10px !important;
  height: 10px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.3) !important;
  flex-shrink: 0 !important;
}

.sidebar .reports-banner-status .status-dot.active,
.reports-banner-status .status-dot.active {
  background: #10b981 !important;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5) !important;
}

/* Map loading overlay */
.map-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
}

.map-loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(45, 80, 22, 0.2);
  border-top-color: #2d5016;
  border-radius: 50%;
  animation: map-spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes map-spin {
  to {
    transform: rotate(360deg);
  }
}

.map-loading-text {
  color: #2d5016;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  font-family: Georgia, 'Times New Roman', Times, serif;
}
</style>
