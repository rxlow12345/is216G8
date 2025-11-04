<!-- src/components/Status.vue -->
<template>
  <BackToTop />
  <!-- Main container with custom styling -->
  <div class="container-fluid p-0">
    <!-- Top Banner -->
    <div class="row">
      <div class="col">
        <div id="topBanner" class="text-center py-5 mb-5">
          <h1 class="animate-fade-up">Report Status: {{ report.reportId }}</h1>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-1"></div>
      <div class="col-md-10 d-flex justify-content-center">
        <div class="container-lg my-1">
          <!-- Loading State -->
          <div v-if="isLoading" class="d-flex justify-content-center align-items-center py-5">
            <div class="spinner-border" style="color: #086143;" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <span class="ms-3 fs-4" style="color: #285436;">Loading report...</span>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="alert alert-danger shadow-sm border-0 p-2">
            <h4 class="alert-heading">An Error Occurred!</h4>
            <p>Sorry, we couldn't fetch the data. Please try again later.</p>
            <hr>
            <p class="mb-0"><strong>Details:</strong> {{ error }}</p>
          </div>

          <!-- Main Content -->
          <div v-else>
            <div v-if="report">
              <!-- Report Card -->
              <div class="card custom-card shadow-lg border-0 rounded-4 mb-5">
                <div class="row g-0 align-items-stretch">

                  <!-- Details -->
                  <div class="col-md-7">
                    <div
                      class="card-header custom-card-header text-white d-flex justify-content-between align-items-center">
                      <h4 class="mb-0">{{ capitalize(report.speciesName) || 'Unnamed Species' }}</h4>
                      <span class="badge custom-badge">
                        {{ capitalize(report.status || 'Unknown Status') }}
                      </span>
                    </div>
                    <div class="card-body p-4">
                      <div class="row mb-3">
                        <div class="col-md-6">
                          <p class="info-item"><strong>Incident Type:</strong> {{ capitalize(report.incidentType) }}</p>
                          <p class="info-item"><strong>Location:</strong> {{ report.location.address }}</p>
                          <p class="info-item"><strong>Severity:</strong>
                            <span :class="severityClass">{{ capitalize(report.severity) }}</span>
                          </p>
                        </div>
                        <div class="col-md-6">
                          <p class="info-item"><strong>Priority:</strong> {{ capitalize(report.priority) }}</p>
                          <p class="info-item"><strong>Urgent:</strong>
                            <span :class="report.isUrgent ? 'text-danger fw-bold' : 'text-muted'">
                              {{ report.isUrgent ? 'Yes ⚠️' : 'No' }}
                            </span>
                          </p>
                          <p class="info-item"><strong>Moving Normally:</strong> {{ capitalize(report.isMovingNormally)
                          }}</p>
                        </div>
                      </div>

                      <div class="mb-3">
                        <p class="mb-2"><strong>Description:</strong></p>
                        <p class="text-muted description-text">{{ report.description || 'No description provided.' }}
                        </p>
                      </div>

                      <p class="text-muted small mb-0">
                        <strong>Reported:</strong> {{ createdAtReadable }}
                      </p>
                    </div>
                  </div>
                  <!-- Photo -->
                  <div class="col-md-5 d-flex justify-content-center align-items-center">
                    <img v-if="report.photoURLs[0]" :src="report.photoURLs[0]" class="img-fluid rounded-start"
                      style="object-fit: cover; max-height: 400px; width: 100%;" alt="Animal photo" />
                    <div v-else class="d-flex justify-content-center align-items-center bg-light rounded-start"
                      style="height: 400px; width: 100%; color: #aaa; font-size: 1.2rem;">
                      No photo available
                    </div>
                  </div>
                </div>
              </div>

              <!-- Photos Section, for more than 1 photo, but not being used -->
              <div v-if="report.photoURLs && report.photoURLs.length > 1"
                class="card custom-card border-0 shadow-sm rounded-4 p-4 mb-4">
                <h6 class="fw-bold mb-3" style="color: #285436;">Additional Photos</h6>
                <div class="d-flex flex-wrap justify-content-center align-items-center gap-3">
                  <img v-for="(url, index) in report.photoURLs" :key="index" :src="url"
                    class="img-thumbnail photo-thumbnail" />
                </div>
              </div>

              <!-- Status Tracker -->
              <div class="card custom-card border-0 shadow-sm rounded-4 p-4 mb-4">
                <h5 class="mb-4 text-center fw-bold" style="color: #285436;">Overall Stages</h5>

                <!-- Progress Bar -->
                <div class="progress custom-progress mb-4">
                  <div class="progress-bar progress-bar-striped custom-progress-bar" role="progressbar"
                    :style="{ width: progressPercent + '%' }" :aria-valuenow="progressPercent" aria-valuemin="0"
                    aria-valuemax="100">
                    {{ capitalize(currentStage) }}
                  </div>
                </div>

                <!-- Status Steps -->
                <div class="d-flex justify-content-between text-center px-3 status-steps-wrapper">
                  <div v-for="(stage, index) in stages" :key="index" class="flex-fill status-step-item">
                    <div class="stage-circle mx-auto mb-2" :class="{
                      'stage-active': index <= currentStageIndex,
                      'stage-inactive': index > currentStageIndex
                    }">
                      <i v-if="index <= currentStageIndex" class="bi bi-check-lg"></i>
                      <span v-else>{{ index + 1 }}</span>
                    </div>
                    <p class="small fw-semibold mb-0"
                      :style="{ color: index <= currentStageIndex ? '#086143' : '#888' }">
                      {{ capitalize(stage) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Timeline -->
              <Timeline
              v-if="(report.status === 'active' || report.status === 'resolved')"
              :reportId="report.reportId"
              >
              </Timeline>

              <!-- Meta Information -->
              <div class="card custom-card border-0 shadow-sm rounded-4 mb-4">
                <div class="card-header custom-card-header-secondary text-white">
                  <h6 class="mb-0">📄 Report Meta Information</h6>
                </div>
                <div class="card-body p-4">
                  <div class="meta-info">
                    <p><strong>Report ID:</strong> {{ report.reportId }} </p>
                    <p><strong>Created:</strong> {{ createdAtReadable || 'N/A' }}</p>
                    <p class="mb-0"><strong>Last Updated:</strong> {{ updatedAtReadable || 'N/A' }}</p>
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
</template>

<script>
import api from '../../src/api/reportApi.js';
import '../css/common.css'
import BackToTop from '../../src/components/BackToTop.vue';
import Timeline from './Timeline.vue';

export default {
  name: 'StatusUpdate',
  components: { Timeline },
  data() {
    return {
      isLoading: true,
      error: null,
      showBackToTop: false,
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
      stages: ["pending", "active", "resolved"],
      checkpointStages: ["arrived", "handled", "treated", "reconciled"]
    };
  },
  computed: {
    currentStage() {
      return this.report.status;
    },
    currentStageIndex() {
      const index = this.stages.findIndex(
        (s) => s.toLowerCase() === this.report.status.toLowerCase()
      );
      return index === -1 ? 0 : index;
    },
    progressPercent() {
      return ((this.currentStageIndex + 1) / this.stages.length) * 100;
    },
    severityClass() {
      return {
        'text-danger fw-bold': this.report.severity === 'high',
        'text-warning fw-semibold': this.report.severity === 'medium',
        'text-success fw-semibold': this.report.severity === 'low'
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
        this.report = await api.getReportByReportId(reportId);
      } catch (e) {
        this.error = e.message;
      }
    },
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    handleScroll() {
      this.showBackToTop = window.scrollY > 300;
    },
    convertDate(timeStamp) {
      const date = new Date(timeStamp._seconds * 1000);
      const options = {
        timeZone: 'Asia/Singapore', // This sets the timezone to GMT+8
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      const formattedDate = date.toLocaleString('en-US', options);
      return formattedDate;
    }
  },
  async mounted() {
    const reportId = this.$route.params.id;
    this.isLoading = true;
    this.error = null;
    await this.fetchReport(reportId);
    this.isLoading = false;
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css');

/* Top Banner */
#topBanner {
  background: linear-gradient(135deg, #285436 0%, #086143 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

#topBanner h1 {
  color: rgb(254, 250, 224);
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: 48px;
  margin-bottom: 0.5rem;
}

#topBanner p {
  font-size: 1.2rem;
  opacity: 0.95;
}

.animate-fade-up {
  animation: fadeUp 1s ease forwards;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
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
  background: linear-gradient(135deg, #BC6C25 0%, #DDA15E 100%);
  padding: 1rem 1.5rem;
}

.custom-badge {
  background-color: #FEFAE0;
  color: #285436;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  font-weight: 600;
  border-radius: 20px;
}

/* Info Items */
.info-item {
  margin-bottom: 0.75rem;
  color: #606C38;
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

.stage-circle>* {
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

/* Photos */
.photo-thumbnail {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border: 3px solid #086143;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.photo-thumbnail:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* Summary Box */
.summary-box {
  background-color: #FEFAE0;
  border-left: 4px solid #BC6C25;
}

/* Meta Info */
.meta-info {
  color: #606C38;
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

  .photo-thumbnail {
    width: 120px;
    height: 120px;
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