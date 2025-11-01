<template>
  <div class="container-fluid p-0 pastReportsPage">
    <!-- Top Banner -->
    <div id="topBanner">
      <header class="text-center mb-2">
        <h1>Past Wildlife Reports</h1>
      </header>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loadingState">
      <div class="loadingSpinner"></div>
      <span class="loadingText">Loading your reports...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="errorState">
      <p><strong>Error:</strong> {{ error }}</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Search Bar -->
      <div class="searchSection">
        <div class="searchBar">
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
      <div class="filterSection">
        <select v-model="selectedSeverity" @change="filterReports" class="filterSelect">
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="urgent">Urgent</option>
        </select>

        <select v-model="selectedStatus" @change="filterReports" class="filterSelect">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
        </select>

        <select v-model="sortOption" @change="sortReports" class="filterSelect">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <!-- Reports List -->
      <div id="reportsContainer" class="reportsContainer">
        <p v-if="filteredReports.length === 0" class="noResults">
          No matching reports found.
        </p>

        <transition-group name="list" tag="div">
          <div
            v-for="report in filteredReports"
            :key="report.reportId"
            :class="['reportCard', 'mb-2', { expanded: expandedReport === report.reportId }]"
          >
            <div class="reportSummary" @click="toggleReport(report.reportId)">
              <div class="reportTitle">
                <strong>{{ report.speciesName || 'Unknown Species' }}</strong>
                <span class="reportSubtitle"> - {{ report.incidentType || 'Unknown Type' }}</span>
              </div>
              <div class="reportTags">
                <span
                  class="tag"
                  :class="{
                    tagLow: report.severity === 'low',
                    tagModerate: report.severity === 'moderate',
                    tagUrgent: report.severity === 'urgent'
                  }"
                >
                  {{ report.severity }}
                </span>
                <span
                  class="tag"
                  :class="{
                    tagPending: report.status === 'pending',
                    tagActive: report.status === 'active',
                    tagResolved: report.status === 'resolved'
                  }"
                >
                  {{ report.status }}
                </span>
                <span class="arrow" v-if="expandedReport === report.reportId">▲</span>
                <span class="arrow" v-else>▼</span>
              </div>
            </div>

            <transition name="expand">
              <div v-if="expandedReport === report.reportId" class="reportDetails">
                <table class="reportDetailsTable">
                  <tbody>
                    <tr>
                      <td><strong>Description</strong></td>
                      <td>{{ report.description || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td><strong>Location</strong></td>
                      <td>{{ report.location || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td><strong>Incident Type</strong></td>
                      <td>{{ report.incidentType || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td><strong>Severity</strong></td>
                      <td>{{ report.severity }}</td>
                    </tr>
                    <tr>
                      <td><strong>Status</strong></td>
                      <td>{{ report.status }}</td>
                    </tr>
                    <tr>
                      <td><strong>Sighting Date</strong></td>
                      <td>{{ formatDate(report.sightingDateTime) }}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="photoGallery" v-if="report.photoURLs?.length">
                  <img
                    v-for="(url, index) in report.photoURLs"
                    :key="index"
                    :src="url"
                    class="photoPreview"
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
</style>
