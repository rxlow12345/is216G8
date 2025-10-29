<!-- src/components/StatusUpdate.vue -->
<template>
  <!-- Main container with Bootstrap padding -->
  <div class="container my-5">
    <!-- Loading State with Bootstrap Spinner -->
    <div v-if="isLoading" class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <span class="ms-3 fs-4">Loading reports...</span>
    </div>

    <!-- Error State with Bootstrap Alert -->
    <div v-else-if="error" class="alert alert-danger">
      <h4 class="alert-heading">An Error Occurred!</h4>
      <p>Sorry, we couldn't fetch the data. Please try again later.</p>
      <hr>
      <p class="mb-0"><strong>Details:</strong> {{ error }}</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <div v-if="report">
        <div class="text-center mb-5">
          <h2 class="fw-bold text-primary">🐾 Animal Rescue Report Status</h2>
          <p class="text-muted">Tracking live rescue progress for report {{ report.reportId }}</p>
        </div>

        <!-- Report Card -->
        <div class="card shadow-lg border-0 rounded-4 mb-4">
          <div class="row g-0">
            <!-- Photo -->
            <div class="col-md-5">
              <img
                :src="report.photoURLs[0]"
                class="img-fluid rounded-start"
                alt="Animal photo"
              />
            </div>

            <!-- Details -->
            <div class="col-md-7">
              <div class="card-body">
                <h4 class="card-title text-primary mb-3">
                  Incident: {{ capitalize(report.incidentType) }}
                </h4>

                <p class="card-text mb-2"><strong>Location:</strong> {{ report.location }}</p>
                <p class="card-text mb-2"><strong>Severity:</strong> 
                  <span :class="severityClass">{{ capitalize(report.severity) }}</span>
                </p>
                <p class="card-text mb-2"><strong>Urgent:</strong> 
                  <span :class="report.isUrgent ? 'text-danger fw-bold' : 'text-secondary'">
                    {{ report.isUrgent ? 'Yes' : 'No' }}
                  </span>
                </p>
                <p class="card-text text-muted small">
                  Reported on: {{ new Date(report.createdAt).toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Tracker -->
        <div class="card border-0 shadow-sm rounded-4 p-4">
          <h5 class="mb-3 text-center fw-semibold">Rescue Progress</h5>

          <!-- Progress Bar -->
          <div class="progress mb-4" style="height: 25px;">
            <div
              class="progress-bar progress-bar-striped progress-bar-animated bg-success"
              role="progressbar"
              :style="{ width: progressPercent + '%' }"
              :aria-valuenow="progressPercent"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {{ currentStage }}
            </div>
          </div>

          <!-- Status Steps -->
          <div class="d-flex justify-content-between text-center">
            <div v-for="(stage, index) in stages" :key="index" class="flex-fill">
              <div
                class="rounded-circle mx-auto mb-2"
                :class="{
                  'bg-success': index <= currentStageIndex,
                  'bg-secondary': index > currentStageIndex
                }"
                style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: white;"
              >
                {{ index + 1 }}
              </div>
              <p class="small">{{ stage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../../src/api/reportApi.js';
import { logout, getCurrentUser } from '../../src/api/auth.js'; // Import auth functions

export default {
  name: 'StatusUpdate',
  data() {
    return {
      isLoading: true,
      error: null,
      // Dummy data (replace with your actual report later)
      report: {
        createdAt: "2025-10-27T01:26:39+08:00",
        description: "nil",
        incidentType: "trapped",
        isMovingNormally: "unknown",
        isUrgent: false,
        location: "Clementi Avenue 6",
        photoURLs: [
          "http://localhost:4100/api/reports/images/83c1475f-1916-46dd-b7f7-59576ec6b989",
        ],
        priority: "low",
        reportId: "WR-MH7ZDPF7-8ZJ8F",
        severity: "low",
        sightingDateTime: "2025-10-27T01:20:00+08:00",
        speciesName: "nil",
        status: "pending",
        updatedAt: "2025-10-27T01:26:39+08:00",
      },
      stages: ["Pending", "Rescue in Progress", "Completed"],
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
  },
  methods: {
    async fetchReport(id) {
      try {
        this.isLoading = true;
        this.error = null;
        this.report = await api.getReportById(id);
      } catch (e) {
        this.error = e.message;
      } finally {
        this.isLoading = false;
      }
    },
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
  },
  async mounted() {
    // Fetch reports
    const reportId = this.$route.params.id;
    this.fetchReport(reportId);
  }
}
</script>

<style scoped>
.progress-bar {
  transition: width 1s ease-in-out;
}

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-4px);
}
</style>