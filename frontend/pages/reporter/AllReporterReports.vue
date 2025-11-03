<template>
  <div class="container-fluid p-0 userReportsPage">
    <!-- Top Banner -->
    <div class="bannerTitles">
      <header class="text-center mb-2">
        <h1>🌿 Your Wildlife Reports 🌿</h1>
        <p>A summary of all reports you’ve submitted</p>
      </header>
    </div>

    <div class="container my-5">
      <!-- Loading State -->
      <div v-if="isLoading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border" style="color: #086143;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-3 fs-4" style="color: #285436;">Loading your reports...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger shadow-sm border-0 rounded-4">
        <h4 class="alert-heading">An Error Occurred!</h4>
        <p>{{ error }}</p>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Dashboard Stats -->
        <div class="row gx-4 gy-4 mb-5">
          <div class="col-12 col-md-6 col-xl-3" v-for="stat in stats" :key="stat.label">
            <div class="statCard shadow-sm">
              <div class="statCardInner" :class="stat.class" @click="filterAndScroll(stat.status)">
                <div class="statIcon">
                  <i :class="stat.icon"></i>
                </div>
                <div class="statContent">
                  <h3 class="statNumber">{{ stat.value }}</h3>
                  <p class="statLabel">{{ stat.label }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Search & Filter Section -->
        <div class="searchSection" ref="reportsSection">
          <div class="searchBar">
            <input
              id="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="🔍 Search by ID or species..."
            />
            <button id="searchBtn" @click="clearSearch">
              {{ searchQuery ? 'Clear' : 'Search' }}
            </button>
          </div>

          <div class="filterSpace">
            <div class="filterSection">
              <!-- Status Filter -->
              <div class="filterSize">
                <label for="statusFilter" class="form-label customLabel">Filter by Status</label>
                <select id="statusFilter" class="form-select customSelect filterSelect" v-model="statusFilter">
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <!-- Urgency Filter -->
              <div class="filterSize">
                <label for="urgencyFilter" class="form-label customLabel">Filter by Urgency</label>
                <select id="urgencyFilter" class="form-select customSelect filterSelect" v-model="urgencyFilter">
                  <option value="all">All Reports</option>
                  <option value="urgent">Urgent Only</option>
                  <option value="non-urgent">Non-Urgent</option>
                </select>
              </div>

              <!-- Sort Order -->
              <div class="filterSize">
                <label for="sortOrder" class="form-label customLabel">Sort by Reporting Time</label>
                <select id="sortOrder" class="form-select customSelect filterSelect" v-model="sortOrder">
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Reports List -->
        <div v-if="filteredReports.length > 0" class="reportsList mt-4">
          <div
            v-for="report in filteredReports"
            :key="report.reportId"
            class="reportItem shadow-sm"
          >
            <div class="reportHeader position-relative">
              <div class="reportMainInfo">
                <h5 class="reportId">
                  <i class="bi bi-file-earmark-text me-2"></i>
                  {{ report.reportId || 'Unknown ID' }}
                </h5>
                <router-link :to="'/status/' + report.reportId" class="no-underline">
                  <button class="viewStatusButton">View Status</button>
                </router-link>
              </div>
            </div>

            <div class="reportDetails">
              <p class="reportInfo mb-1 capitalise">
                <i class="bi bi-award me-2"></i>
                <strong>Species:</strong> {{ report.speciesName || 'Unknown Species' }}
              </p>
              <p class="reportInfo mb-1">
                <i class="bi bi-geo-alt me-2"></i>
                <strong>Location: </strong> {{ report.location }}
              </p>
              <p class="reportInfo mb-1">
                <i class="bi bi-calendar-event me-2"></i>
                Reported on {{ formatDate(report.createdAt) }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="emptyState text-center py-5">
          <i class="bi bi-inbox emptyIcon"></i>
          <h4 class="emptyTitle mt-3">No Reports Found</h4>
          <p class="emptyText">You haven’t submitted any reports yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../../src/api/reportApi.js';
import { getCurrentUser } from '../../src/api/auth.js';
import '../css/pastReports.css';
import '../css/common.css';

export default {
  name: 'UserReports',
  data() {
    return {
      reports: [],
      isLoading: true,
      error: null,
      userUid: '',
      searchQuery: '',
      statusFilter: 'all',
      urgencyFilter: 'all',
      sortOrder: 'desc',
    };
  },
  computed: {
    totalReports() {
      return this.reports.length;
    },
    pendingReports() {
      return this.reports.filter(r => r.status === 'pending').length;
    },
    activeReports() {
      return this.reports.filter(r => r.status === 'active').length;
    },
    resolvedReports() {
      return this.reports.filter(r => r.status === 'resolved').length;
    },
    stats() {
      return [
        { label: 'Total Reports', value: this.totalReports, icon: 'bi bi-clipboard-data', class: 'statTotal', status: 'all' },
        { label: 'Pending', value: this.pendingReports, icon: 'bi bi-clock-history', class: 'statPending', status: 'pending' },
        { label: 'Active', value: this.activeReports, icon: 'bi bi-activity', class: 'statActive', status: 'active' },
        { label: 'Resolved', value: this.resolvedReports, icon: 'bi bi-check-circle', class: 'statResolved', status: 'resolved' },
      ];
    },
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

      filtered.sort((a, b) => {
        const dateA = a.createdAt?._seconds || 0;
        const dateB = b.createdAt?._seconds || 0;
        return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });

      return filtered;
    },
  },
  methods: {
    async fetchReports() {
      try {
        this.isLoading = true;
        const user = await getCurrentUser();
        if (!user || !user.uid) throw new Error('User not authenticated.');
        this.userUid = user.uid;

        const allReports = await api.getAllReports();
        this.reports = allReports.filter(r => r.uid === this.userUid);
      } catch (err) {
        this.error = err.message || 'Failed to fetch reports.';
      } finally {
        this.isLoading = false;
      }
    },
    clearSearch() {
      if (this.searchQuery) {
        this.searchQuery = '';
      }
    },
    filterAndScroll(status) {
      this.statusFilter = status;
      const section = this.$refs.reportsSection;
      if (section) {
        const yOffset = -80;
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    },
    formatDate(timestamp) {
      if (!timestamp) return 'Unknown date';
      let date;
      if (timestamp._seconds) date = new Date(timestamp._seconds * 1000);
      else if (timestamp.seconds) date = new Date(timestamp.seconds * 1000);
      else if (timestamp instanceof Date) date = timestamp;
      else if (typeof timestamp === 'string' || typeof timestamp === 'number') date = new Date(timestamp);
      return date ? date.toLocaleDateString() : 'Invalid date';
    },
  },
  mounted() {
    this.fetchReports();
  },
};
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css');

/* ===== Dashboard Stats ===== */
.statCard {
  border-radius: 16px;
  border: none;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  margin: 0.5rem;
}
.statCard:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15) !important;
}
.statCardInner {
  padding: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.statIcon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}
.statContent {
  flex-grow: 1;
}
.statNumber {
  font-size: 2.5rem;
  font-weight: 700;
}
.statLabel {
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.9;
}

/* Variants */
.statTotal {
  background: #086143;
  color: white;
}
.statTotal .statIcon {
  background: rgba(255, 255, 255, 0.2);
}
.statPending {
  background: #bc6c25;
  color: white;
}
.statPending .statIcon {
  background: rgba(255, 255, 255, 0.2);
}
.statActive {
  background: #15aa78;
  color: white;
}
.statActive .statIcon {
  background: rgba(255, 255, 255, 0.2);
}
.statResolved {
  background: #086143;
  color: white;
}
.statResolved .statIcon {
  background: rgba(255, 255, 255, 0.2);
}

/* ===== Filter Section ===== */
.filterSize {
  width: 33%;
}

.filterSize label {
  margin-left: 15px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .filterSection {
    max-width: 600px;
    width: calc(100% - 20px);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .filterSize {
    width: 100%;
  }
}

/* ===== Reports Section ===== */
.reportsList {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.reportItem {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}
.reportItem:hover {
  transform: translateX(8px);
  border-color: #086143;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12) !important;
}

/* === Align Report ID and View Status Button === */
.reportMainInfo {
  display: flex;
  align-items: center; /* Vertical align */
  justify-content: space-between; /* ID left, button right */
  gap: 1rem;
  margin-bottom: 20px;
}

.reportId {
  padding-bottom: 0;
  margin: 0;
  display: flex;
  align-items: center;
  color: #285436;
  font-weight: 600;
  font-size: 1.1rem;
}

.viewStatusButton {
  background-color: #dda15e;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  width: 120px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}
.viewStatusButton:hover {
  background-color: #bc6c25;
}

.no-underline {
  text-decoration: none;
  color: inherit; 
}

.reportInfo {
  font-size: 0.95rem;
  color: #606c38;
}
.reportInfo i {
  color: #086143;
}

/* Empty State */
.emptyState {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
}
.emptyIcon {
  font-size: 4rem;
  color: #a8c686;
}
.emptyTitle {
  color: #285436;
  font-weight: 600;
}
.emptyText {
  color: #606c38;
  font-size: 1.05rem;
}
</style>
