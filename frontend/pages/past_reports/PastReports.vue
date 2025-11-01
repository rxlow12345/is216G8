<template>
  <div class="container-fluid p-0 past-reports-page">
    <!-- Top Banner -->
    <div id="topBanner">
      <header class="text-center mb-2">
        <h1>Past Wildlife Reports</h1>
      </header>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <span class="ms-3 fs-4">Loading your reports...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger text-center mt-4">
      <p><strong>Error:</strong> {{ error }}</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Search Bar -->
      <div class="search-section">
        <div class="search-bar">
          <input
            id="searchInput"
            v-model="searchQuery"
            @input="filterReports"
            type="text"
            placeholder="Search reports..."
          />
          <button id="searchBtn" @click="filterReports">Search</button>
        </div>
      </div>


      <!-- Filter Section -->
      <div class="filter-section">
        <select id="severityFilter" v-model="selectedSeverity" @change="filterReports" class="filter-select">
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="urgent">Urgent</option>
        </select>

        <select id="statusFilter" v-model="selectedStatus" @change="filterReports" class="filter-select">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select id="sortFilter" v-model="sortOption" @change="sortReports" class="filter-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <!-- <option value="severityHigh">Severity (High → Low)</option>
          <option value="severityLow">Severity (Low → High)</option> -->
        </select>
      </div>


      <!-- Reports List -->
      <div id="reportsContainer">
        <p v-if="filteredReports.length === 0" class="text-center text-muted mt-4">
          No matching reports found.
        </p>

        <transition-group name="list" tag="div">
          <div
            v-for="report in filteredReports"
            :key="report.reportId"
            class="report-card mb-2"
          >
            <div
              class="report-summary d-flex justify-content-between align-items-center p-3"
              @click="toggleReport(report.reportId)"
            >
              <div>
                <strong>{{ report.speciesName || 'Unknown Species' }}</strong> - 
                {{ report.incidentType || 'Unknown Type' }}
              </div>
              <div>
                <span class="badge bg-secondary me-2">{{ report.severity }}</span>
                <span class="badge bg-success">{{ report.status }}</span>
                <span v-if="expandedReport === report.reportId">▲</span>
                <span v-else>▼</span>
              </div>
            </div>

            <transition name="expand">
              <div
                v-if="expandedReport === report.reportId"
                class="report-details p-3 border-top bg-light"
              >
                <p><strong>Description:</strong> {{ report.description || 'N/A' }}</p>
                <p><strong>Location:</strong> {{ report.location || 'N/A' }}</p>
                <p><strong>Incident Type:</strong> {{ report.incidentType || 'N/A' }}</p>
                <p><strong>Severity:</strong> {{ report.severity }}</p>
                <p><strong>Status:</strong> {{ report.status }}</p>
                <p><strong>Priority:</strong> {{ report.priority || 'N/A' }}</p>
                <p><strong>Sighting Date:</strong> {{ formatDate(report.sightingDateTime) }}</p>
                <!-- <p><strong>Created At:</strong> {{ formatDate(report.createdAt) }}</p>
                <p><strong>Updated At:</strong> {{ formatDate(report.updatedAt) }}</p> -->
                <div class="photo-gallery mt-2" v-if="report.photoURLs?.length">
                  <img
                    v-for="(url, index) in report.photoURLs"
                    :key="index"
                    :src="url"
                    class="photo-preview me-2 mb-2"
                    alt="Report image"
                  />
                </div>
              </div>
            </transition>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../../src/api/reportApi.js'
import { getCurrentUser } from '../../src/api/auth.js'
import '../css/pastReports.css'

export default {
  name: 'PastReports',
  data() {
    return {
      reports: [],
      filteredReports: [],
      expandedReport: null,
      searchQuery: '',
      selectedSeverity: '',
      selectedStatus: '',
      sortOption: 'newest',
      isLoading: true,
      error: null,
      userUid: '',
    }
  },
  methods: {
    async fetchReports() {
      try {
        this.isLoading = true
        this.error = null

        // Wait for user authentication
        const user = await getCurrentUser()
        if (!user || !user.uid) throw new Error('User not authenticated.')
        this.userUid = user.uid

        const allReports = await api.getAllReports()
        // Only include reports created by the current user
        this.reports = allReports.filter(r => r.uid === this.userUid)
        this.filteredReports = [...this.reports]
        this.sortReports()
      } catch (err) {
        console.error('Failed to fetch reports:', err)
        this.error = err.message || 'Failed to fetch reports.'
      } finally {
        this.isLoading = false
      }
    },
    filterReports() {
      const query = this.searchQuery.toLowerCase()
      this.filteredReports = this.reports.filter(r => {
        const matchesSearch =
          r.speciesName?.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query)
        const matchesSeverity =
          !this.selectedSeverity || r.severity === this.selectedSeverity
        const matchesStatus =
          !this.selectedStatus || r.status === this.selectedStatus
        return matchesSearch && matchesSeverity && matchesStatus
      })
      this.sortReports()
    },
    sortReports() {
      const order = { urgent: 3, moderate: 2, low: 1 };

      // Log all reports' sightingDateTime
      // this.filteredReports.forEach(report => {
      //   console.log("Report ID:", report.reportId);
      //   console.log("Sighting DateTime (Raw):", report.sightingDateTime);
      //   console.log("Sighting DateTime (Parsed):", this.parseTimestamp(report.sightingDateTime));
      // });

      switch (this.sortOption) {
        case 'newest':
          // Sort by sightingDateTime (most recent first)
          this.filteredReports.sort((a, b) => {
            const dateA = this.parseTimestamp(a.sightingDateTime);
            const dateB = this.parseTimestamp(b.sightingDateTime);
            
            // console.log("DateA:", dateA, "DateB:", dateB);  // Log parsed dates

            return dateB - dateA;  // Most recent first
          });
          break;
        case 'oldest':
          // Sort by sightingDateTime (oldest first)
          this.filteredReports.sort((a, b) => {
            const dateA = this.parseTimestamp(a.sightingDateTime);
            const dateB = this.parseTimestamp(b.sightingDateTime);

            // console.log("DateA:", dateA, "DateB:", dateB);  // Log parsed dates

            return dateA - dateB;  // Oldest first
          });
          break;
        case 'severityHigh':
          this.filteredReports.sort((a, b) => (order[b.severity] || 0) - (order[a.severity] || 0));
          break;
        case 'severityLow':
          this.filteredReports.sort((a, b) => (order[a.severity] || 0) - (order[b.severity] || 0));
          break;
      }
    },

    // Helper function to parse Firestore Timestamp and convert it to a Date object
    parseTimestamp(timestamp) {
      if (!timestamp) return new Date(0); // Return a very old date if no timestamp

      // If the timestamp is a Firestore Timestamp object
      if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000);  // Convert seconds to milliseconds
      }

      // If it's already a JavaScript Date object
      if (timestamp instanceof Date) {
        return timestamp;
      }

      // If it's a string, try to convert it
      if (typeof timestamp === 'string') {
        return new Date(timestamp);
      }

      // Default case: Return a default date if parsing fails
      return new Date(0);  // Return the default Date if parsing fails
    },
    toggleReport(reportId) {
      this.expandedReport = this.expandedReport === reportId ? null : reportId
    },
    formatDate(timestamp) {
      console.log("Raw Timestamp:", timestamp);
      
      if (!timestamp) return 'Unknown date';

      let date;

      // If the timestamp is a Proxy object (Vue reactivity)
      if (timestamp && timestamp._seconds !== undefined) {
        console.log("Firestore Proxy Timestamp detected with _seconds:", timestamp._seconds);
        date = new Date(timestamp._seconds * 1000); // Use _seconds for the correct value
      }
      // If it's a Firestore Timestamp object
      else if (timestamp && timestamp.seconds !== undefined) {
        console.log("Firestore Timestamp detected with seconds:", timestamp.seconds);
        date = new Date(timestamp.seconds * 1000);
      } 
      // If it's already a Date object
      else if (timestamp instanceof Date) {
        console.log("Date object detected");
        date = timestamp;
      } 
      // If it's a string, try to parse it
      else if (typeof timestamp === 'string') {
        console.log("String detected");
        date = new Date(timestamp);
      } 
      // If it's a number (like a timestamp)
      else if (typeof timestamp === 'number') {
        console.log("Number detected");
        date = new Date(timestamp);
      } 
      else {
        console.log("Invalid date type detected");
        return 'Invalid date';
      }

      // Check if the conversion worked
      if (isNaN(date.getTime())) {
        console.log("Invalid date detected");
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-SG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
  async mounted() {
    await this.fetchReports()
  },
}
</script>

<style scoped>
/* .report-card {
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}
.report-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.report-summary {
  background-color: #f8f9fa;
}

.report-details {
  animation: fadeIn 0.3s ease forwards;
}

.photo-gallery img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding: 0 1rem;
}
.expand-enter-to, .expand-leave-from {
  max-height: 1000px;
  opacity: 1;
  padding: 1rem;
}

.list-move {
  transition: all 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
} */
</style>
