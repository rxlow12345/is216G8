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
      reports: [],
      isLoading: true,
      error: null,
    };
  },
  computed: {
    filteredReports() {
      return this.reports.filter(report => {
        const statusMatch = this.statusFilter === 'all' || report.status === this.statusFilter;
        const searchLower = this.searchQuery.toLowerCase();
        const speciesName = report.speciesName || 'Unknown Species';
        const searchMatch = report.reportId.toLowerCase().includes(searchLower) ||
                            speciesName.toLowerCase().includes(searchLower);
        return statusMatch && searchMatch;
      });
    },
  },
  methods: {
    async fetchReports() {
      try {
        this.isLoading = true;
        this.error = null;
        this.reports = await api.getAllReports();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.isLoading = false;
      }
    },
  },
  async mounted() {
    // Fetch reports
    this.fetchReports();
  }
};
</script>

<style scoped>
</style>