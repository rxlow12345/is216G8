<!-- src/components/StatusUpdate.vue -->

<script>
import api from '../../api/reportApi.js'; // Make sure this path is correct
import { logout, getCurrentUser } from '../../api/auth.js'; // Import auth functions

export default {
  name: 'StatusUpdate',
  data() {
    return {
      reports: [],
      isLoading: true,
      error: null,
      statusFilter: 'all',
      searchQuery: '',
      selectedReport: null,
      userEmail: '' // Add user email for display
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
    // Computed props for stat cards are the same
    totalReports() { return this.reports.length; },
    pendingReports() { return this.reports.filter(r => r.status === 'pending').length; },
    inProgressReports() { return this.reports.filter(r => r.status === 'in-progress').length; },
    resolvedReports() { return this.reports.filter(r => r.status === 'resolved').length; }
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
    async handleStatusChange(reportId, newStatus) {
      try {
        await api.updateReportStatus(reportId, newStatus);
        const reportToUpdate = this.reports.find(r => r.id === reportId);
        if (reportToUpdate) reportToUpdate.status = newStatus;
        if (this.selectedReport && this.selectedReport.id === reportId) {
          this.selectedReport.status = newStatus;
        }
      } catch (e) {
        console.error('Failed to update status:', e);
        alert('Failed to update the report status.');
      }
    },
    selectReport(report) {
      this.selectedReport = report;
    },
    closeModal() {
      this.selectedReport = null;
    },
    formatDate(timestamp) {
      if (!timestamp || !timestamp._seconds) return 'N/A';
      return new Date(timestamp._seconds * 1000).toLocaleString();
    },
    async handleLogout() {
      try {
        await logout();
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
      }
    }
  },
  async mounted() {
    // Get current user info
    try {
      const user = await getCurrentUser();
      if (user) {
        this.userEmail = user.email;
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
    
    // Fetch reports
    this.fetchReports();
  }
};
</script>

<template>
  <!-- Main container with Bootstrap padding -->
  <div class="container my-5">
    
    <!-- Header -->
    <div class="pb-3 mb-4 border-bottom d-flex justify-content-between align-items-center">
      <h1 class="display-5 mb-0">Reports Dashboard</h1>
      <div class="d-flex align-items-center">
        <span class="me-3 text-muted">Welcome, {{ userEmail }}</span>
        <button class="btn btn-outline-danger" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>
    </div>

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
      <!-- INTERACTIVE FEATURE: Dashboard Stats using Bootstrap Cards and Grid -->
      <div class="row g-4 mb-4">
        <div class="col-md-6 col-xl-3">
          <div class="card h-100 shadow-sm border-start border-primary border-5">
            <div class="card-body text-center">
              <h5 class="card-title fs-1 fw-bold">{{ totalReports }}</h5>
              <p class="card-text text-muted">Total Reports</p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-xl-3">
          <div class="card h-100 shadow-sm border-start border-warning border-5">
            <div class="card-body text-center">
              <h5 class="card-title fs-1 fw-bold">{{ pendingReports }}</h5>
              <p class="card-text text-muted">Pending</p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-xl-3">
          <div class="card h-100 shadow-sm border-start border-info border-5">
            <div class="card-body text-center">
              <h5 class="card-title fs-1 fw-bold">{{ inProgressReports }}</h5>
              <p class="card-text text-muted">In Progress</p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-xl-3">
          <div class="card h-100 shadow-sm border-start border-success border-5">
            <div class="card-body text-center">
              <h5 class="card-title fs-1 fw-bold">{{ resolvedReports }}</h5>
              <p class="card-text text-muted">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      <!-- INTERACTIVE FEATURE: Filtering and Search using Bootstrap Forms -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-5">
              <label for="status-filter" class="form-label">Filter by Status</label>
              <select id="status-filter" class="form-select" v-model="statusFilter">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div class="col-md-7">
              <label for="search-input" class="form-label">Search by Report ID or Species</label>
              <input id="search-input" type="text" class="form-control" v-model="searchQuery" placeholder="Start typing to search...">
            </div>
          </div>
        </div>
      </div>

      <!-- The Report List using Bootstrap List Group -->
      <div v-if="filteredReports.length > 0" class="list-group shadow-sm">
        <a href="#" v-for="report in filteredReports" :key="report.id" 
           @click.prevent="selectReport(report)" 
           class="list-group-item list-group-item-action">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ report.speciesName || 'Unknown Species' }}</h5>
            <!-- Status Badge using Bootstrap Badge component -->
            <span :class="['badge', `bg-${report.status === 'pending' ? 'warning text-dark' : report.status === 'in-progress' ? 'primary' : report.status === 'resolved' ? 'success' : 'secondary'}`]">{{ report.status }}</span>
          </div>
          <p class="mb-1 text-muted">{{ report.location }}</p>
          <small class="text-muted">{{ report.reportId }} &middot; Reported on {{ formatDate(report.createdAt) }}</small>
        </a>
      </div>

      <div v-else class="text-center py-5">
        <p class="lead">No reports match your filters.</p>
      </div>
    </div>

    <!-- INTERACTIVE FEATURE: The Modal using Bootstrap Modal classes -->
    <div v-if="selectedReport" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content shadow-lg">
          <div class="modal-header">
            <h5 class="modal-title">Report Details: {{ selectedReport.reportId }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-4">
              <div class="col-md-5" v-if="selectedReport.photoURLs && selectedReport.photoURLs.length > 0">
                <img :src="selectedReport.photoURLs[0]" class="img-fluid rounded" alt="Report Photo">
              </div>
              <div :class="selectedReport.photoURLs && selectedReport.photoURLs.length > 0 ? 'col-md-7' : 'col-12'">
                <p><strong>Species:</strong> {{ selectedReport.speciesName || 'Not specified' }}</p>
                <p><strong>Status:</strong> <span :class="['badge', `bg-${selectedReport.status === 'pending' ? 'warning text-dark' : selectedReport.status === 'in-progress' ? 'primary' : selectedReport.status === 'resolved' ? 'success' : 'secondary'}`]">{{ selectedReport.status }}</span></p>
                <p><strong>Location:</strong> {{ selectedReport.location }}</p>
                <p><strong>Sighting Time:</strong> {{ formatDate(selectedReport.sightingDateTime) }}</p>
                <p><strong>Description:</strong> {{ selectedReport.description }}</p>
                <hr>
                <p><strong>Reporter Contact:</strong> {{ selectedReport.contactEmail }} | {{ selectedReport.contactPhone }}</p>
                <p><strong>Urgent?</strong> {{ selectedReport.isUrgent ? 'Yes, Urgent' : 'No' }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeModal">Close</button>
            <button type="button" class="btn btn-primary" @click="handleStatusChange(selectedReport.id, 'in-progress')">Set In Progress</button>
            <button type="button" class="btn btn-success" @click="handleStatusChange(selectedReport.id, 'resolved')">Set Resolved</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Backdrop for the modal -->
    <div v-if="selectedReport" class="modal-backdrop fade show"></div>
  </div>
</template>

<style scoped>
/*
  With Bootstrap, we need very little custom CSS!
  The 'scoped' attribute ensures these styles only apply to this component.
*/
.list-group-item-action {
  cursor: pointer; /* Makes it clear the list items are clickable */
}

/* A little extra style for the stats cards to make numbers pop */
.card-title {
  font-family: 'system-ui', sans-serif;
}
</style>