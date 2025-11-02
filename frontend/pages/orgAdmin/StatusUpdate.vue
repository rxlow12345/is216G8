<!-- src/components/StatusUpdate.vue -->
<template>
  <!-- Main container -->
  <div class="dashboard-container">

    <!-- Top Banner -->
    <div id="topBanner" class="text-center py-5">
      <h1 class="animate-fade-up">Report Dashboard</h1>
    </div>

    <div class="container my-5">
      <!-- Loading State -->
      <div v-if="isLoading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border" style="color: #086143;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-3 fs-4" style="color: #285436;">Loading reports...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger shadow-sm border-0 rounded-4">
        <h4 class="alert-heading">An Error Occurred!</h4>
        <p>Sorry, we couldn't fetch the data. Please try again later.</p>
        <hr>
        <p class="mb-0"><strong>Details:</strong> {{ error }}</p>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Dashboard Stats -->
        <div class="row g-4 mb-5">
          <div class="col-md-6 col-xl-3">
            <div class="stat-card shadow-sm h-100">
              <div class="stat-card-inner stat-total" @click="filterAndScroll('all')">
                <div class="stat-icon">
                  <i class="bi bi-clipboard-data"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">{{ totalReports }}</h3>
                  <p class="stat-label">Total Reports</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-xl-3">
            <div class="stat-card shadow-sm h-100">
              <div class="stat-card-inner stat-pending" @click="filterAndScroll('pending')">
                <div class="stat-icon">
                  <i class="bi bi-clock-history"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">{{ pendingReports }}</h3>
                  <p class="stat-label">Pending</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-xl-3">
            <div class="stat-card shadow-sm h-100">
              <div class="stat-card-inner stat-active" @click="filterAndScroll('active')">
                <div class="stat-icon">
                  <i class="bi bi-activity"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">{{ activeReports }}</h3>
                  <p class="stat-label">Active</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-xl-3">
            <div class="stat-card shadow-sm h-100">
              <div class="stat-card-inner stat-resolved" @click="filterAndScroll('resolved')">
                <div class="stat-icon">
                  <i class="bi bi-check-circle"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">{{ resolvedReports }}</h3>
                  <p class="stat-label">Resolved</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtering and Search -->
        <div class="filter-card shadow-sm mb-4" ref="reportsSection">
          <div class="card-body p-4">
            <h5 class="filter-title mb-4">
              <i class="bi bi-funnel me-2"></i>Filter & Search Reports
            </h5>
            <div class="row g-3">
              <!-- Status Filter -->
              <div class="col-md-4">
                <label for="status-filter" class="form-label custom-label">Filter by Status</label>
                <select id="status-filter" class="form-select custom-select" v-model="statusFilter">
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <!-- Urgency Filter -->
              <div class="col-md-4">
                <label for="urgency-filter" class="form-label custom-label">Filter by Urgency</label>
                <select id="urgency-filter" class="form-select custom-select" v-model="urgencyFilter">
                  <option value="all">All Reports</option>
                  <option value="urgent">Urgent Only</option>
                  <option value="non-urgent">Non-Urgent</option>
                </select>
              </div>

              <!-- Sort by Time -->
              <div class="col-md-4">
                <label for="sort-filter" class="form-label custom-label">Sort by Reporting Time</label>
                <select id="sort-filter" class="form-select custom-select" v-model="sortOrder">
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>

              <!-- Search -->
              <div class="col-12">
                <label for="search-input" class="form-label custom-label">Search by Report ID or Species</label>
                <div class="search-wrapper">
                  <i class="bi bi-search search-icon"></i>
                  <input id="search-input" type="text" class="form-control custom-search" v-model="searchQuery"
                    placeholder="Start typing to search...">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Report List -->
        <div v-if="filteredReports.length > 0" class="reports-list">
          <div v-for="report in filteredReports" :key="report.id" @click="selectReport(report)"
            class="report-item shadow-sm">
            <div class="report-header position-relative">
              <div class="report-main-info d-flex justify-content-between align-items-center">
                <h5 class="report-id mb-2 mt-2">
                  <i class="bi bi-file-earmark-text me-2"></i>
                  {{ report.reportId || 'Unknown ID' }}
                </h5>
                <span :class="['status-badge', `status-${report.status}`]">
                  {{ capitalise(report.status) }}
                </span>
              </div>
            </div>

            <div class="report-details">
              <p class="report-info mb-1">
                <i class="bi bi-award me-2"></i>
                <strong>Species: </strong> {{ report.speciesName }}
              </p>
              <p class="report-info mb-1">
                <i class="bi bi-geo-alt me-2"></i>
                <strong>Location: </strong> {{ report.location }}
              </p>
              <p class="report-date mb-0">
                <i class="bi bi-calendar-event me-2"></i>
                Reported on {{ formatDate(report.createdAt) }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="empty-state text-center py-5">
          <i class="bi bi-inbox empty-icon"></i>
          <h4 class="empty-title mt-3">No Reports Found</h4>
          <p class="empty-text">No reports match your current filters.</p>
        </div>
      </div>

      <!-- Modal -->
      <Teleport to="body">
        <!-- use the modal component, pass in the prop -->
        <Modal :selectedReport="selectedReport" @close="this.selectedReport = null"
          @statusChange="this.handleStatusChange">
        </Modal>
      </Teleport>

      <!-- Modal -->
      <div v-if="false" class="modal fade show" style="display: block;" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content custom-modal shadow-lg">
            <div class="modal-header custom-modal-header">
              <h5 class="modal-title">
                <i class="bi bi-file-earmark-check me-2"></i>
                Report Details: {{ selectedReport.reportId }}
              </h5>
              <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
            </div>
            <div class="modal-body p-4">
              <div class="row g-4">
                <div class="col-md-5" v-if="selectedReport.photoURLs && selectedReport.photoURLs.length > 0">
                  <img :src="selectedReport.photoURLs[0]" class="img-fluid rounded-4 modal-image" alt="Report Photo">
                </div>
                <div :class="selectedReport.photoURLs && selectedReport.photoURLs.length > 0 ? 'col-md-7' : 'col-12'">
                  <div class="modal-info-section">
                    <div class="info-row">
                      <i class="bi bi-award info-icon"></i>
                      <div>
                        <strong>Species:</strong>
                        <span class="ms-2">{{ selectedReport.speciesName || 'Not specified' }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <i class="bi bi-flag info-icon"></i>
                      <div>
                        <strong>Status:</strong>
                        <span :class="['status-badge ms-2', `status-${selectedReport.status}`]">
                          {{ selectedReport.status }}
                        </span>
                      </div>
                    </div>
                    <div class="info-row">
                      <i class="bi bi-geo-alt info-icon"></i>
                      <div>
                        <strong>Location:</strong>
                        <span class="ms-2">{{ selectedReport.location }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <i class="bi bi-calendar-event info-icon"></i>
                      <div>
                        <strong>Sighting Time:</strong>
                        <span class="ms-2">{{ formatDate(selectedReport.sightingDateTime) }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <i class="bi bi-chat-left-text info-icon"></i>
                      <div>
                        <strong>Description:</strong>
                        <p class="description-text mt-2 mb-0">{{ selectedReport.description }}</p>
                      </div>
                    </div>
                    <hr class="my-3">
                    <div class="info-row">
                      <i class="bi bi-person-circle info-icon"></i>
                      <div>
                        <strong>Reporter Contact:</strong>
                        <span class="ms-2">{{ selectedReport.contactEmail }} | {{ selectedReport.contactPhone
                        }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <i class="bi bi-exclamation-triangle info-icon"></i>
                      <div>
                        <strong>Urgent:</strong>
                        <span :class="['ms-2', selectedReport.isUrgent ? 'text-danger fw-bold' : 'text-muted']">
                          {{ selectedReport.isUrgent ? 'Yes, Urgent ⚠️' : 'No' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer custom-modal-footer">
              <button type="button" class="btn btn-outline-secondary custom-btn-outline" @click="closeModal">
                <i class="bi bi-x-circle me-2"></i>Close
              </button>
              <button type="button" class="btn custom-btn-active"
                @click="handleStatusChange(selectedReport.id, 'active')">
                <i class="bi bi-play-circle me-2"></i>Set Active
              </button>
              <button type="button" class="btn custom-btn-resolved"
                @click="handleStatusChange(selectedReport.id, 'resolved')">
                <i class="bi bi-check-circle me-2"></i>Set Resolved
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Backdrop for the modal -->
      <div v-if="selectedReport" class="modal-backdrop fade show"></div>
    </div>

    <!-- Back to Top Button -->
    <button class="back-to-top" @click="scrollToTop" v-show="showBackToTop">
      <i class="bi bi-arrow-up"></i>
    </button>
  </div>
</template>

<script>
import api from '../../src/api/reportApi.js';
import { logout, getCurrentUser } from '../../src/api/auth.js';
import Modal from './Modal.vue'

export default {
  name: 'StatusUpdate',
  components: { Modal },
  data() {
    return {
      showModal: false,
      reports: [],
      isLoading: true,
      error: null,
      statusFilter: 'all',
      searchQuery: '',
      selectedReport: null,
      userEmail: '',
      showBackToTop: false,
      sortOrder: 'desc',
      urgencyFilter: 'all'
    };
  },
  computed: {
    filteredReports() {
      let filtered = this.reports.filter(report => {
        const statusMatch = this.statusFilter === 'all' || report.status === this.statusFilter;
        const urgencyMatch =
          this.urgencyFilter === 'all' ||
          (this.urgencyFilter === 'urgent' && report.isUrgent) ||
          (this.urgencyFilter === 'non-urgent' && !report.isUrgent);

        const searchLower = this.searchQuery.toLowerCase();
        const speciesName = report.speciesName || 'Unknown Species';
        const searchMatch =
          (report.reportId && report.reportId.toLowerCase().includes(searchLower)) ||
          speciesName.toLowerCase().includes(searchLower);

        return statusMatch && urgencyMatch && searchMatch;
      });

      // Sort by report date
      filtered.sort((a, b) => {
        const dateA = a.createdAt?._seconds || 0;
        const dateB = b.createdAt?._seconds || 0;
        return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });

      return filtered;
    },
    totalReports() { return this.reports.length; },
    pendingReports() { return this.reports.filter(r => r.status === 'pending').length; },
    activeReports() { return this.reports.filter(r => r.status === 'active').length; },
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
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    handleScroll() {
      this.showBackToTop = window.scrollY > 300;
    },
    capitalise(val) {
      return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    },
    filterAndScroll(status) {
      this.statusFilter = status;

      // Smooth scroll
      const section = this.$refs.reportsSection;
      if (section) {
        const yOffset = -80; // adjust this to your navbar height or desired offset
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
      }
    },
  },
  async mounted() {
    try {
      const user = await getCurrentUser();
      if (user) {
        this.userEmail = user.username || user.email;
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }

    this.fetchReports();
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }
};
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css');

* {
  margin: 0;
  padding: 0;
}

.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #FEFAE0 0%, #f8f9fa 100%);
}

/* Stat Cards */
.stat-card {
  border-radius: 16px;
  border: none;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15) !important;
}

.stat-card-inner {
  padding: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
}

.stat-content {
  flex-grow: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  line-height: 1;
}

.stat-label {
  font-size: 0.95rem;
  margin-bottom: 0;
  font-weight: 500;
  opacity: 0.9;
}

/* Stat Card Variants */
.stat-total {
  background: #086143;
  color: white;
}

.stat-total .stat-icon {
  background: rgba(255, 255, 255, 0.2);
}

.stat-pending {
  background: #BC6C25;
  color: white;
}

.stat-pending .stat-icon {
  background: rgba(255, 255, 255, 0.2);
}

.stat-active {
  background: #15aa78;
  color: white;
}

.stat-active .stat-icon {
  background: rgba(255, 255, 255, 0.2);
}

.stat-resolved {
  background: #086143;
  color: white;
}

.stat-resolved .stat-icon {
  background: rgba(255, 255, 255, 0.2);
}

/* Filter Card */
.filter-card {
  background: white;
  border-radius: 16px;
  border: none;
}

.filter-title {
  color: #285436;
  font-weight: 600;
  font-size: 1.1rem;
}

.custom-label {
  color: #285436;
  font-weight: 600;
  font-size: 0.9rem;
}

.custom-select {
  border: 2px solid #a8c686;
  border-radius: 10px;
  padding: 0.65rem;
  color: #285436;
  transition: all 0.3s ease;
}

.custom-select:focus {
  border-color: #086143;
  box-shadow: 0 0 0 0.2rem rgba(8, 97, 67, 0.25);
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #606C38;
  z-index: 10;
}

.custom-search {
  border: 2px solid #a8c686;
  border-radius: 10px;
  padding: 0.65rem 0.65rem 0.65rem 2.75rem;
  color: #285436;
  transition: all 0.3s ease;
}

.custom-search:focus {
  border-color: #086143;
  box-shadow: 0 0 0 0.2rem rgba(8, 97, 67, 0.25);
}

/* Reports List */
.reports-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.report-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.report-item:hover {
  transform: translateX(8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12) !important;
  border-color: #086143;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.report-main-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.report-id {
  color: #285436;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}

.status-badge {
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  position: absolute;
  top: 0;
  right: 0;
  margin-right: 0.5rem;
}

@media (max-width: 767.98px) {
  .status-badge {
    position: static;
    display: inline-block;
  }
}

.status-pending {
  background-color: #DDA15E;
  color: white;
}

.status-active {
  background-color: #16cb59;
  color: white;
}

.status-resolved {
  background-color: #086143;
  color: white;
}

.status-closed {
  background-color: #6c757d;
  color: white;
}

.report-details {
  color: #606C38;
}

.report-info {
  font-size: 0.95rem;
}

.report-info i {
  color: #086143;
  width: 20px;
}

.report-date {
  font-size: 0.85rem;
  color: #888;
  display: flex;
  align-items: center;
}

.report-date i {
  color: #BC6C25;
}

.report-arrow {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #086143;
  font-size: 1.25rem;
  opacity: 0;
  transition: all 0.3s ease;
}

.report-item:hover .report-arrow {
  opacity: 1;
  right: 1rem;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: #a8c686;
}

.empty-title {
  color: #285436;
  font-weight: 600;
}

.empty-text {
  color: #606C38;
  font-size: 1.05rem;
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

  .stat-number {
    font-size: 2rem;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .report-arrow {
    display: none;
  }

  .report-item:hover {
    transform: translateX(0);
  }
}

@media (max-width: 576px) {
  #topBanner h1 {
    font-size: 1.75rem;
  }

  .stat-card-inner {
    padding: 1.25rem;
    flex-direction: column;
    text-align: center;
  }

  .back-to-top {
    bottom: 20px;
    right: 20px;
    padding: 10px 16px;
    font-size: 14px;
  }
}
</style>