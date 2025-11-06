<!-- src/components/Status.vue -->
<template>
  <BackToTop />
  <!-- Main container with custom styling -->
  <div class="container-fluid p-0">
    <!-- Top Banner -->
    <div class="bannerTitles">
      <header class="text-center mb-2">
        <h1>📋 Rescue Report 📋</h1>
        <p>ID: {{ report.reportId || "Loading..." }}</p>
      </header>
    </div>
    <div class="row" style="margin-top: 40px">
      <div class="col-md-1"></div>
      <div class="col-md-10 d-flex justify-content-center">
        <div class="container-lg my-1">
          <!-- Loading State -->
          <div
            v-if="isLoading"
            class="d-flex justify-content-center align-items-center py-5"
          >
            <div class="spinner-border" style="color: #086143" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <span class="ms-3 fs-4" style="color: #285436"
              >Loading report...</span
            >
          </div>

          <!-- Error State -->
          <div
            v-else-if="error"
            class="alert alert-danger shadow-sm border-0 p-2"
          >
            <h4 class="alert-heading">An Error Occurred!</h4>
            <p>Sorry, we couldn't fetch the data. Please try again later.</p>
            <hr />
            <p class="mb-0"><strong>Details:</strong> {{ error }}</p>
          </div>

          <!-- Main Content -->
          <div v-else>
            <div v-if="report">
              <!-- Report Card -->
              <div class="card custom-card shadow-lg border-0 rounded-4 mb-5">
                <!-- Green Header Banner - Full Width -->
                <div
                  class="card-header custom-card-header text-white d-flex justify-content-between align-items-center"
                >
                  <h4 class="mb-0">
                    {{ capitalize(report.speciesName) || "Unnamed Species" }}
                  </h4>
                  <span class="badge custom-badge">
                    {{ capitalize(report.status || "Unknown Status") }}
                  </span>
                </div>

                <!-- Content Row: Image on Left, Details on Right -->
                <div class="row g-0">
                  <!-- Photo Section - Left Column -->
                  <div class="col-md-5 d-flex align-items-stretch">
                    <div class="card-body p-4 flex-fill d-flex">
                      <div class="animal-image-section">
                        <img
                          v-if="
                            report.photoURLs &&
                            report.photoURLs[0] &&
                            !imageError
                          "
                          :src="report.photoURLs[0]"
                          class="animal-image"
                          :alt="`${
                            report.speciesName || 'Animal'
                          } rescue photo`"
                          @error="handleImageError"
                          @load="imageLoading = false"
                        />
                        <div v-else class="image-placeholder">
                          <span class="placeholder-icon">🐾</span>
                          <p>No photo available</p>
                        </div>
                        <div
                          v-if="
                            imageLoading &&
                            report.photoURLs &&
                            report.photoURLs[0] &&
                            !imageError
                          "
                          class="image-loading"
                        >
                          <span class="loading-spinner">📷</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Report Details - Right Column -->
                  <div class="col-md-7 d-flex align-items-stretch">
                    <div class="card-body p-4 flex-fill d-flex flex-column">
                      <div class="row mb-3">
                        <div class="col-md-6">
                          <p class="info-item">
                            <strong>Incident Type:</strong>
                            {{ capitalize(report.incidentType) }}
                          </p>
                          <p class="info-item">
                            <strong>Location:</strong>
                            {{
                              report.location?.address ||
                              report.location ||
                              "Unknown Location"
                            }}
                          </p>
                          <p class="info-item">
                            <strong>Severity: </strong>
                            <span :class="severityClass">{{
                              capitalize(report.severity)
                            }}</span>
                          </p>
                        </div>
                        <div class="col-md-6">
                          <p class="info-item">
                            <strong>Priority:</strong>
                            {{ capitalize(report.priority) }}
                          </p>
                          <p class="info-item">
                            <strong>Urgent: </strong>
                            <span
                              :class="
                                report.isUrgent
                                  ? 'text-danger fw-bold'
                                  : 'text-muted'
                              "
                            >
                              {{ report.isUrgent ? "Yes ⚠️" : "No" }}
                            </span>
                          </p>
                          <p class="info-item">
                            <strong>Moving Normally:</strong>
                            {{ capitalize(report.isMovingNormally) }}
                          </p>
                        </div>
                      </div>

                      <div class="mb-3">
                        <p class="mb-2"><strong>Description:</strong></p>
                        <p class="text-muted description-text">
                          {{ report.description || "No description provided." }}
                        </p>
                      </div>

                      <p class="text-muted small mb-0">
                        <strong>Reported:</strong> {{ createdAtReadable }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Photos Section, for more than 1 photo -->
              <div
                v-if="report.photoURLs && report.photoURLs.length > 1"
                class="card custom-card border-0 shadow-sm rounded-4 p-4 mb-4"
              >
                <h6 class="fw-bold mb-3" style="color: #285436">
                  Additional Photos
                </h6>
                <div
                  class="d-flex flex-wrap justify-content-center align-items-center gap-3"
                >
                  <div
                    v-for="(url, index) in report.photoURLs"
                    :key="index"
                    v-show="!thumbnailErrors[index]"
                    class="photo-thumbnail-container"
                  >
                    <img
                      :src="url"
                      class="photo-thumbnail"
                      :alt="`Additional photo ${index + 1}`"
                      @error="handleThumbnailError($event, index)"
                      @load="handleThumbnailLoad"
                    />
                  </div>
                </div>
              </div>

              <!-- Compact Timeline View -->
              <div
                class="card custom-card border-0 shadow-sm rounded-4 p-4 mb-4"
                v-if="
                  (report.status === 'active' ||
                    report.status === 'resolved' ||
                    report.status === 'pending') &&
                  canViewRescueJourney
                "
              >
                <h5 class="section-title mb-4">Rescue Journey Progress</h5>

                <div class="timeline-compact">
                  <!-- Horizontal Stage Icons -->
                  <div class="stage-icons-row">
                    <div
                      v-for="(stage, index) in stages"
                      :key="index"
                      class="stage-icon-wrapper"
                    >
                      <div
                        class="stage-icon"
                        :class="{
                          completed:
                            index < currentStageIndex ||
                            (index === currentStageIndex && currentStageIndex >= 0 &&
                             // Stage 5 (index 4) only shows as completed if status is 'resolved' AND reconciled checkpoint has outcome
                             (index !== 4 || (report.status === 'resolved' && report.checkpoints?.reconciled?.completed && report.checkpoints?.reconciled?.outcome))),
                          pending:
                            index > currentStageIndex || 
                            currentStageIndex < 0 ||
                            (index === currentStageIndex && index === 4 && (report.status !== 'resolved' || !report.checkpoints?.reconciled?.completed || !report.checkpoints?.reconciled?.outcome)),
                        }"
                      >
                        <i
                          v-if="
                            (index < currentStageIndex || 
                             (index === currentStageIndex && currentStageIndex >= 0 &&
                              (index !== 4 || (report.status === 'resolved' && report.checkpoints?.reconciled?.completed && report.checkpoints?.reconciled?.outcome))))
                          "
                          class="bi bi-check-lg"
                        ></i>
                        <span v-else>{{ index + 1 }}</span>
                      </div>
                      <span class="stage-name">{{ stage }}</span>
                      <div
                        v-if="index < stages.length - 1"
                        class="stage-connector"
                        :class="{
                          completed:
                            index < currentStageIndex && currentStageIndex >= 0,
                        }"
                      ></div>
                    </div>
                  </div>

                  <!-- Progress Bar -->
                  <div class="progress-bar-container">
                    <div
                      class="progress-bar-fill"
                      :style="{ width: Math.max(progressPercent, 0) + '%' }"
                    ></div>
                  </div>

                  <!-- Progress Summary -->
                  <div class="progress-summary">
                    <p class="progress-text">
                      <strong
                        >{{ completedStagesCount }} of
                        {{ stages.length }}</strong
                      >
                      stages completed ({{ Math.round(progressPercent) }}%)
                    </p>
                  </div>

                  <!-- Button to open modal -->
                  <button
                    class="view-timeline-button"
                    @click="showTimelineModal = true"
                  >
                    📋 View Full Timeline Details
                  </button>
                </div>
              </div>

              <!-- Meta Information -->
              <div class="card custom-card border-0 shadow-sm rounded-4 mb-4">
                <div
                  class="card-header custom-card-header-secondary text-white"
                >
                  <h6 class="mb-0">📄 Report Meta Information</h6>
                </div>
                <div class="card-body p-4">
                  <div class="meta-info">
                    <p><strong>Report ID:</strong> {{ report.reportId }}</p>
                    <p>
                      <strong>Created:</strong> {{ createdAtReadable || "N/A" }}
                    </p>
                    <p class="mb-0">
                      <strong>Last Updated:</strong>
                      {{ updatedAtReadable || "N/A" }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-1"></div>
    </div>
  </div>

  <!-- Back to Top Button -->
  <button class="back-to-top" @click="scrollToTop" v-show="showBackToTop">
    <i class="bi bi-arrow-up"></i>
  </button>

  <!-- Timeline Modal -->
  <div
    v-if="showTimelineModal && canViewRescueJourney"
    class="timeline-modal-overlay"
    @click="showTimelineModal = false"
  >
    <div class="timeline-modal-content" @click.stop>
      <div class="modal-header">
        <h2>Rescue Journey Timeline</h2>
        <button class="modal-close-button" @click="showTimelineModal = false">
          ✕
        </button>
      </div>

      <div class="modal-body">
        <!-- Full Vertical Timeline -->
        <Timeline
          v-if="
            report.status === 'active' ||
            report.status === 'resolved' ||
            report.status === 'pending'
          "
          :reportId="report.reportId"
          :volunteerETA="report.volunteerETA"
          :timeAccepted="report.timeAccepted"
          :volunteerInfo="volunteerInfo"
          :hasVolunteer="
            !!(report.assignedVolunteerID || report.uid || report.volunteerId)
          "
          :reportData="report"
        />
      </div>
    </div>
  </div>
</template>

<script>
import api from "../../src/api/reportApi.js";
import "../css/common.css";
import BackToTop from "../../src/components/BackToTop.vue";
import Timeline from "./Timeline.vue";
import { getCurrentUser } from "../../src/api/auth.js";
import { db } from "../../src/firebase.js";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default {
  name: "StatusUpdate",
  components: { Timeline },
  data() {
    return {
      isLoading: true,
      error: null,
      showBackToTop: false,
      currentUser: null,
      userRole: null,
      report: {
        createdAt: "",
        description: "",
        incidentType: "",
        isMovingNormally: "",
        isUrgent: false,
        location: "",
        photoURLs: [],
        priority: "",
        reportId: "",
        severity: "",
        sightingDateTime: "",
        speciesName: "",
        status: "",
        updatedAt: "",
      },
      imageError: false,
      imageLoading: true,
      thumbnailErrors: {},
      stages: [
        "Case Accepted",
        "Volunteer Arrival",
        "Animal Secured",
        "Medical Assessment",
        "Case Resolved",
      ],
      checkpointStages: ["arrived", "handled", "treated", "reconciled"],
      volunteerInfo: {
        name: null,
        email: null,
      },
      showTimelineModal: false,
      unsubscribeActiveSummary: null,
      unsubscribeIncidentReport: null,
    };
  },
  watch: {
    showTimelineModal(newVal) {
      // Prevent body scroll when modal is open
      if (newVal) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    },
  },
  computed: {
    isVolunteerViewer() {
      return (
        (this.$route?.query?.viewer || "").toString().toLowerCase() ===
        "volunteer"
      );
    },
    canViewRescueJourney() {
      // Only reporter and admin can view the Rescue Journey Progress section
      return this.userRole === "reporter" || this.userRole === "admin";
    },
    currentStage() {
      const index = this.currentStageIndex;
      if (index >= 0 && index < this.stages.length) {
        return this.stages[index];
      }
      return "Pending";
    },
    currentStageIndex() {
      // Map report status and checkpoints to the 5 recommended stages
      // Stage 1: Case Accepted - check if volunteerId exists
      if (
        !this.report.assignedVolunteerID &&
        !this.report.uid &&
        !this.report.volunteerId
      ) {
        return -1; // Case not accepted yet - no volunteer assigned
      }

      // Stage 5: Case Resolved - only show when status is 'resolved' AND reconciled checkpoint has outcome
      // Status becomes 'resolved' only when volunteer completes reconciled checkpoint with outcome
      if (
        this.report.status === 'resolved' &&
        this.report.checkpoints?.reconciled?.completed &&
        this.report.checkpoints?.reconciled?.outcome
      ) {
        return 4; // Case Resolved (Stage 5, index 4)
      }

      // Stage 4: Medical Assessment - checkpoints.treated (diagnosis, treatment)
      if (this.report.checkpoints?.treated?.completed) {
        return 3; // Medical Assessment (Stage 4, index 3)
      }

      // Stage 3: Animal Secured - checkpoints.handled
      if (this.report.checkpoints?.handled?.completed) {
        return 2; // Animal Secured (Stage 3, index 2)
      }

      // Stage 2: Volunteer Arrival - checkpoints.arrived
      if (this.report.checkpoints?.arrived?.completed) {
        return 1; // Volunteer Arrival (Stage 2, index 1)
      }

      // Stage 1: Case Accepted - volunteer assigned but not arrived yet
      return 0; // Case Accepted (Stage 1, index 0)
    },
    progressPercent() {
      // Calculate progress based on completed stages
      let completedStages = 0;
      const totalStages = 5;

      // Stage 1: Case Accepted - check if volunteerId exists
      if (
        this.report.assignedVolunteerID ||
        this.report.uid ||
        this.report.volunteerId
      ) {
        completedStages++;
      }

      // Stage 2-4: Checkpoints
      if (this.report.checkpoints?.arrived?.completed) completedStages++;
      if (this.report.checkpoints?.handled?.completed) completedStages++;
      if (this.report.checkpoints?.treated?.completed) completedStages++; // Stage 4: Medical Assessment
      
      // Stage 5: Case Resolved - only count when status is 'resolved' AND has outcome
      if (
        this.report.status === 'resolved' &&
        this.report.checkpoints?.reconciled?.completed &&
        this.report.checkpoints?.reconciled?.outcome
      ) {
        completedStages++;
      }

      return (completedStages / totalStages) * 100;
    },
    completedStagesCount() {
      let count = 0;
      if (
        this.report.assignedVolunteerID ||
        this.report.uid ||
        this.report.volunteerId
      )
        count++;
      if (this.report.checkpoints?.arrived?.completed) count++;
      if (this.report.checkpoints?.handled?.completed) count++;
      if (this.report.checkpoints?.treated?.completed) count++; // Stage 4: Medical Assessment
      // Stage 5: Case Resolved - only count when status is 'resolved' AND has outcome
      if (
        this.report.status === 'resolved' &&
        this.report.checkpoints?.reconciled?.completed &&
        this.report.checkpoints?.reconciled?.outcome
      ) {
        count++;
      }
      return count;
    },
    severityClass() {
      return {
        "text-danger fw-bold": this.report.severity === "high",
        "text-warning fw-semibold": this.report.severity === "medium",
        "text-success fw-semibold": this.report.severity === "low",
      };
    },
    createdAtReadable() {
      return this.convertDate(this.report.createdAt);
    },
    updatedAtReadable() {
      return this.convertDate(this.report.updatedAt);
    },
  },
  methods: {
    async fetchReport(reportId) {
      try {
        // Fetch report data
        this.report = await api.getReportByReportId(reportId);

        // Also fetch activeSummary to get checkpoint data (checkpoints are in activeStatusSummary, not incidentReports)
        try {
          const activeSummary = await api.getActiveSummary(reportId);
          if (activeSummary) {
            // Merge checkpoint data and other fields from activeSummary into report
            if (activeSummary.checkpoints) {
              this.report.checkpoints = activeSummary.checkpoints;
            }
            // Merge volunteer assignment info if not present in report
            if (
              !this.report.assignedVolunteerID &&
              !this.report.uid &&
              !this.report.volunteerId
            ) {
              if (activeSummary.volunteerID) {
                this.report.assignedVolunteerID = activeSummary.volunteerID;
              }
              if (activeSummary.uid) {
                this.report.uid = activeSummary.uid;
              }
              if (activeSummary.volunteerId) {
                this.report.volunteerId = activeSummary.volunteerId;
              }
            }
            // Merge other useful fields
            if (activeSummary.timeAccepted && !this.report.timeAccepted) {
              this.report.timeAccepted = activeSummary.timeAccepted;
            }
            if (activeSummary.volunteerETA && !this.report.volunteerETA) {
              // Handle Firestore Timestamp conversion
              if (activeSummary.volunteerETA && typeof activeSummary.volunteerETA.toDate === 'function') {
                this.report.volunteerETA = activeSummary.volunteerETA.toDate().toISOString();
              } else {
                this.report.volunteerETA = activeSummary.volunteerETA;
              }
            }
            if (activeSummary.estimatedDurationMinutes !== undefined) {
              this.report.estimatedDurationMinutes = activeSummary.estimatedDurationMinutes;
            }
          }
        } catch (summaryError) {
          // Continue even if activeSummary fails - report data is still useful
        }

        // Reset image loading state
        this.imageLoading = true;
        this.imageError = false;
        // Fetch volunteer name and email if volunteer is assigned
        if (
          this.report.assignedVolunteerID ||
          this.report.uid ||
          this.report.volunteerId
        ) {
          try {
            // Fetch volunteer name from API
            try {
              const volunteerName = await api.getVolunteerName(reportId);
              this.volunteerInfo.name = volunteerName;
            } catch (nameError) {
              // Fallback to report data if API fails
              if (this.report.assignedVolunteerName) {
                this.volunteerInfo.name = this.report.assignedVolunteerName;
              } else if (this.report.volunteerName) {
                this.volunteerInfo.name = this.report.volunteerName;
              }
            }
            
            // Fetch volunteer email
            try {
              const volunteerEmail = await api.getUserEmail(reportId);
              this.volunteerInfo.email = volunteerEmail;
            } catch (emailError) {
            }
          } catch (error) {
          }
        }
      } catch (e) {
        this.error = e.message;
      }
    },
    handleImageError(event) {
      this.imageError = true;
      this.imageLoading = false;
    },
    handleThumbnailError(event, index) {
      // Mark thumbnail as failed - will hide container via v-show
      // Use Vue.set for reactivity in Vue 2, or direct assignment for Vue 3
      if (this.$set) {
        this.$set(this.thumbnailErrors, index, true);
      } else {
        this.thumbnailErrors[index] = true;
      }
    },
    handleThumbnailLoad() {
      // Thumbnail loaded successfully
    },
    getCurrentStageName() {
      // If no volunteer assigned, show "Pending"
      if (this.currentStageIndex < 0) {
        return "Pending";
      }
      // currentStageIndex is the last completed stage, so current stage is the next one
      // If all stages completed (currentStageIndex is last index), show last stage
      if (this.currentStageIndex >= this.stages.length - 1) {
        return this.stages[this.stages.length - 1];
      }
      // Show the next stage (the one currently in progress)
      const nextStageIndex = this.currentStageIndex + 1;
      return this.stages[nextStageIndex] || this.stages[this.currentStageIndex];
    },
    capitalize(str) {
      if (!str) return ""; // Example of a fix, but for verification, just log
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    handleScroll() {
      this.showBackToTop = window.scrollY > 300;
    },
    convertDate(timeStamp) {
      const date = new Date(timeStamp._seconds * 1000);
      const options = {
        timeZone: "Asia/Singapore", // This sets the timezone to GMT+8
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      const formattedDate = date.toLocaleString("en-US", options);
      return formattedDate;
    },
    setupRealtimeListeners(reportId) {
      // Listen to activeStatusSummary for checkpoint updates
      const activeSummaryQuery = query(
        collection(db, "activeStatusSummary"),
        where("reportId", "==", reportId)
      );
      
      this.unsubscribeActiveSummary = onSnapshot(
        activeSummaryQuery,
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            
            
            // Update checkpoints
            if (data.checkpoints) {
              this.report.checkpoints = data.checkpoints;
            }
            
            // Update volunteer assignment info (always update if present)
            const volunteerIdChanged = 
              (data.volunteerID !== undefined && data.volunteerID !== this.report.assignedVolunteerID) ||
              (data.uid !== undefined && data.uid !== this.report.uid) ||
              (data.volunteerId !== undefined && data.volunteerId !== this.report.volunteerId);
            
            if (data.volunteerID !== undefined) {
              this.report.assignedVolunteerID = data.volunteerID;
            }
            if (data.uid !== undefined) {
              this.report.uid = data.uid;
            }
            if (data.volunteerId !== undefined) {
              this.report.volunteerId = data.volunteerId;
            }
            
            // If volunteer ID changed, fetch volunteer name
            if (volunteerIdChanged && (data.volunteerID || data.uid || data.volunteerId)) {
              const reportId = this.report.reportId;
              if (reportId) {
                api.getVolunteerName(reportId).then(name => {
                  this.volunteerInfo.name = name;
                }).catch(err => {
                });
              }
            }
            
            // Update other useful fields
            if (data.timeAccepted !== undefined) {
              this.report.timeAccepted = data.timeAccepted;
            }
            if (data.volunteerETA !== undefined) {
              // Handle Firestore Timestamp conversion
              if (data.volunteerETA && typeof data.volunteerETA.toDate === 'function') {
                this.report.volunteerETA = data.volunteerETA.toDate().toISOString();
              } else {
                this.report.volunteerETA = data.volunteerETA;
              }
            }
            if (data.estimatedDurationMinutes !== undefined) {
              this.report.estimatedDurationMinutes = data.estimatedDurationMinutes;
            }
          }
        },
        (error) => {
        }
      );
      
      // Listen to incidentReports for status updates
      const incidentReportQuery = query(
        collection(db, "incidentReports"),
        where("reportId", "==", reportId)
      );
      
      this.unsubscribeIncidentReport = onSnapshot(
        incidentReportQuery,
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            
            
            // Update report status and other fields
            if (data.status !== undefined) {
              this.report.status = data.status;
            }
            if (data.updatedAt !== undefined) {
              this.report.updatedAt = data.updatedAt;
            }
            
            // Check if volunteer ID changed
            const volunteerIdChanged = 
              (data.assignedVolunteerID !== undefined && data.assignedVolunteerID !== this.report.assignedVolunteerID) ||
              (data.uid !== undefined && data.uid !== this.report.uid) ||
              (data.volunteerId !== undefined && data.volunteerId !== this.report.volunteerId);
            
            if (data.assignedVolunteerID !== undefined) {
              this.report.assignedVolunteerID = data.assignedVolunteerID;
            }
            if (data.uid !== undefined) {
              this.report.uid = data.uid;
            }
            if (data.volunteerId !== undefined) {
              this.report.volunteerId = data.volunteerId;
            }
            
            // If volunteer ID changed, fetch volunteer name
            if (volunteerIdChanged && (data.assignedVolunteerID || data.uid || data.volunteerId)) {
              const reportId = this.report.reportId;
              if (reportId) {
                api.getVolunteerName(reportId).then(name => {
                  this.volunteerInfo.name = name;
                }).catch(err => {
                });
              }
            }
            
            // Fallback to report data if available
            if (data.assignedVolunteerName !== undefined) {
              this.report.assignedVolunteerName = data.assignedVolunteerName;
              if (!this.volunteerInfo.name) {
                this.volunteerInfo.name = data.assignedVolunteerName;
              }
            }
            if (data.volunteerName !== undefined) {
              this.report.volunteerName = data.volunteerName;
              if (!this.volunteerInfo.name) {
                this.volunteerInfo.name = data.volunteerName;
              }
            }
            
            // Update ETA-related fields
            if (data.timeAccepted !== undefined) {
              this.report.timeAccepted = data.timeAccepted;
            }
            if (data.volunteerETA !== undefined) {
              this.report.volunteerETA = data.volunteerETA;
            }
            if (data.estimatedDurationMinutes !== undefined) {
              this.report.estimatedDurationMinutes = data.estimatedDurationMinutes;
            }
          }
        },
        (error) => {
        }
      );
    },
  },
  async mounted() {
    // Get current user and role
    try {
      const user = await getCurrentUser();
      if (user) {
        this.currentUser = user;
        this.userRole = user.role;
      }
    } catch (error) {
    }

    const reportId = this.$route.params.id;
    this.isLoading = true;
    this.error = null;
    await this.fetchReport(reportId);
    this.isLoading = false;
    window.addEventListener("scroll", this.handleScroll);
    
    // Set up real-time listeners for checkpoint and status updates
    this.setupRealtimeListeners(reportId);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    // Restore body scroll in case component unmounts with modal open
    document.body.style.overflow = "";
    
    // Clean up Firestore listeners
    if (this.unsubscribeActiveSummary) {
      this.unsubscribeActiveSummary();
      this.unsubscribeActiveSummary = null;
    }
    if (this.unsubscribeIncidentReport) {
      this.unsubscribeIncidentReport();
      this.unsubscribeIncidentReport = null;
    }
  },
};
</script>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css");

/* Top Banner - using common.css bannerTitles styles */
.bannerTitles {
  width: 100% !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 20px !important;
  box-sizing: border-box !important;
  overflow-x: hidden !important;
  background-color: #285436 !important;
}

.bannerTitles header {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}

.bannerTitles h1 {
  margin-top: 20px !important;
  margin-bottom: 0 !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

.bannerTitles p {
  font-weight: 200 !important;
  color: rgb(254, 250, 224) !important;
  font-size: 20px !important;
  margin-top: 8px !important;
  margin-bottom: 0 !important;
}

@media (max-width: 520px) {
  .bannerTitles {
    padding: 20px !important;
  }

  .bannerTitles h1 {
    font-size: 40px !important;
    margin-top: 20px !important;
  }

  .bannerTitles p {
    font-size: 20px !important;
  }
}

/* Custom Cards */
.custom-card {
  background-color: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.custom-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15) !important;
}

.custom-card-header {
  background: linear-gradient(135deg, #086143 0%, #046949 100%);
  padding: 1.25rem 1.5rem;
}

.custom-card-header-secondary {
  background: linear-gradient(135deg, #bc6c25 0%, #dda15e 100%);
  padding: 1rem 1.5rem;
}

.custom-badge {
  background-color: #fefae0;
  color: #285436;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  font-weight: 600;
  border-radius: 20px;
}

/* Info Items */
.info-item {
  margin-bottom: 0.75rem;
  color: #606c38;
  font-size: 0.95rem;
}

.info-item strong {
  color: #285436;
}

.description-text {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #086143;
  line-height: 1.6;
}

/* Progress Bar */
.custom-progress {
  width: 100%;
  max-width: 100%;
  height: 35px;
  border-radius: 20px;
  background-color: #e9ecef;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
}

.custom-progress-bar {
  background: linear-gradient(135deg, #15aa78 0%, #16cb59 100%);
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(22, 203, 89, 0.3);
  transition: width 1s ease-in-out;
}

/* Stage Circles */
.stage-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.stage-circle > * {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.stage-circle span {
  line-height: 1;
}

.stage-circle i,
.stage-circle span {
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stage-circle span {
  transform: translateY(-1px);
}

.stage-active {
  background: linear-gradient(135deg, #086143 0%, #16cb59 100%);
  animation: pulse 2s infinite;
}

.stage-inactive {
  background-color: #94d3a2;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 4px 10px rgba(8, 97, 67, 0.3);
  }

  50% {
    box-shadow: 0 4px 20px rgba(8, 97, 67, 0.6);
  }
}

/* Main Animal Image Section */
.animal-image-section {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 280px;
  max-height: 520px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
}

/* Main Animal Image */
.animal-image {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

/* Optional: subtle zoom effect on hover */
.animal-image:hover {
  transform: scale(1.05);
}

/* Image Placeholder */
.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #aaa;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

.placeholder-icon {
  font-size: 64px;
  opacity: 0.5;
  margin-bottom: 10px;
}

.image-placeholder p {
  font-size: 1.1rem;
  color: #888;
  margin: 0;
}

/* Image Loading State */
.image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.loading-spinner {
  font-size: 48px;
  opacity: 0.3;
  animation: pulse 2s infinite;
}

/* Thumbnail Container */
.photo-thumbnail-container {
  position: relative;
  width: 150px;
  height: 150px;
  overflow: hidden;
  border-radius: 12px;
  border: 3px solid #086143;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

/* Thumbnail Images */
.photo-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensures thumbnails always look good */
  object-position: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.photo-thumbnail:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

/* Summary Box */
.summary-box {
  background-color: #fefae0;
  border-left: 4px solid #bc6c25;
}

/* Meta Info */
.meta-info {
  color: #606c38;
  font-size: 0.9rem;
}

/* Back to Top Button */
.back-to-top {
  position: fixed;
  bottom: 40px;
  right: 40px;
  background: linear-gradient(135deg, #086143 0%, #046949 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 50px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 8px 20px rgba(8, 97, 67, 0.4);
}

.back-to-top:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(16, 185, 129, 0.6);
}

/* ==================== COMPACT TIMELINE VIEW ==================== */
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d5f4f;
  text-align: center;
}

.timeline-compact {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Horizontal stage icons */
.stage-icons-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  padding: 0 20px;
}

.stage-icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  position: relative;
}

.stage-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  background: white;
  border: 3px solid #e5e7eb;
  color: #9ca3af;
  transition: all 0.3s;
  z-index: 2;
  position: relative;
}

.stage-icon.completed {
  background: #2d5f4f;
  border-color: #2d5f4f;
  color: white;
}

.stage-name {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  font-weight: 500;
  max-width: 100px;
  line-height: 1.3;
}

.stage-icon-wrapper:has(.stage-icon.completed) .stage-name,
.stage-icon.completed + .stage-name {
  color: #2d5f4f;
  font-weight: 600;
}

/* Connecting line between stages */
.stage-connector {
  position: absolute;
  top: 24px;
  left: 70%;
  width: 100%;
  height: 3px;
  background: #e5e7eb;
  z-index: 1;
}

.stage-connector.completed {
  background: #2d5f4f;
}

/* Progress bar */
.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #2d5f4f 0%, #1e4a3a 100%);
  transition: width 0.5s ease;
  border-radius: 4px;
}

/* Progress summary text */
.progress-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.progress-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.current-stage-text {
  font-size: 15px;
  color: #374151;
  margin: 0;
}

.current-stage-text strong {
  color: #2d5f4f;
}

/* View timeline button */
.view-timeline-button {
  width: 100%;
  padding: 14px 24px;
  background: #2d5f4f;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.view-timeline-button:hover {
  background: #1e4a3a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 95, 79, 0.3);
}

/* ==================== TIMELINE MODAL ==================== */
.timeline-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* Higher than navbar (Bootstrap fixed-top is usually 1030) */
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.timeline-modal-content {
  background: white;
  border-radius: 16px;
  max-width: 550px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.timeline-modal-content .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.timeline-modal-content .modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #2d5f4f;
  margin: 0;
}

.modal-close-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: white;
  color: #6b7280;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-close-button:hover {
  background: #f3f4f6;
  color: #374151;
  transform: rotate(90deg);
}

.timeline-modal-content .modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  #topBanner h1 {
    font-size: 2rem;
  }

  #topBanner p {
    font-size: 1rem;
  }

  .stage-circle {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }

  .animal-image-section {
    min-height: 220px;
    max-height: 360px;
  }

  .photo-thumbnail-container {
    width: 120px;
    height: 120px;
  }

  .photo-thumbnail {
    width: 100%;
    height: 100%;
  }

  /* Compact timeline responsive */
  .stage-icons-row {
    flex-wrap: wrap;
    gap: 16px;
    padding: 0;
  }

  .stage-icon-wrapper {
    flex: 0 0 calc(50% - 8px);
    min-width: 120px;
  }

  .stage-connector {
    display: none;
  }

  .stage-name {
    font-size: 11px;
  }

  /* Modal responsive */
  .timeline-modal-content {
    max-width: 90%;
    max-height: 90vh;
    margin: 10px;
  }

  .timeline-modal-content .modal-header {
    padding: 14px 16px;
  }

  .timeline-modal-content .modal-header h2 {
    font-size: 16px;
  }

  .timeline-modal-content .modal-body {
    padding: 14px 16px;
  }
}

@media (max-width: 576px) {
  #topBanner h1 {
    font-size: 1.75rem;
  }

  .custom-badge {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }

  .back-to-top {
    bottom: 20px;
    right: 20px;
    padding: 10px 16px;
    font-size: 14px;
  }

  .custom-progress-bar {
    font-size: 0.8rem;
  }

  .status-steps-wrapper {
    flex-direction: column;
    gap: 1.25rem;
    align-items: flex-start;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }

  .status-step-item {
    display: flex;
    align-items: center;
    text-align: left;
    flex: none !important;
  }

  .status-step-item .stage-circle {
    margin: 0 1rem 0 0;
  }
}
</style>
