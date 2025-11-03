<template>
  <BackToTop/>
  <div class="container-fluid p-0 pastReportsPage">
    <!-- Top Banner -->
    <div id="topBanner" class="bannerTitles">
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
            placeholder="🔍 Search reports..."
          />
          <button
            id="searchBtn"
            @click="handleSearchButtonClick"
          >
            {{ searchQuery ? 'Clear' : 'Search' }}
          </button>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filterSpace">
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
                      <td><strong>Report ID</strong></td>
                      <td>{{ report.reportId || 'N/A' }}</td>
                    </tr>
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
                      <td class="capitalise">{{ report.incidentType || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td><strong>Severity</strong></td>
                      <td class="capitalise">{{ report.severity }}</td>
                    </tr>
                    <tr>
                      <td><strong>Status</strong></td>
                      <td class="capitalise">{{ report.status }}</td>
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
import '../css/common.css'
import BackToTop from '../../src/components/BackToTop.vue'

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

        const user = await getCurrentUser()
        if (!user || !user.uid) throw new Error('User not authenticated.')
        this.userUid = user.uid

        const allReports = await api.getAllReports()
        this.reports = allReports.filter(r => r.uid === this.userUid)
        this.filteredReports = [...this.reports]
        this.sortReports()
      }
      catch (err) {
        console.error('Failed to fetch reports:', err)
        this.error = err.message || 'Failed to fetch reports.'
      }
      finally {
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
    handleSearchButtonClick() {
      if (this.searchQuery) {
        this.searchQuery = ''
        this.filterReports()
      }
      else {
        this.filterReports()
      }
    },
    sortReports() {
      const order = { urgent: 3, moderate: 2, low: 1 };
      
      switch (this.sortOption) {
        case 'newest':
          this.filteredReports.sort((a, b) => {
            const dateA = this.parseTimestamp(a.sightingDateTime);
            const dateB = this.parseTimestamp(b.sightingDateTime);
            return dateB - dateA;  // Most recent first
          });
          break;
        case 'oldest':
          this.filteredReports.sort((a, b) => {
            const dateA = this.parseTimestamp(a.sightingDateTime);
            const dateB = this.parseTimestamp(b.sightingDateTime);
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
    parseTimestamp(timestamp) {
      if (!timestamp) return new Date(0); // Return a very old date if no timestamp

      if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000);
      }
      
      if (timestamp instanceof Date) {
        return timestamp;
      }

      if (typeof timestamp === 'string') {
        return new Date(timestamp);
      }

      return new Date(0);
    },
    toggleReport(reportId) {
      this.expandedReport = this.expandedReport === reportId ? null : reportId
    },
    formatDate(timestamp) {
      if (!timestamp) return 'Unknown date';

      let date;

      if (timestamp && timestamp._seconds !== undefined) {
        date = new Date(timestamp._seconds * 1000);
      }
      else if (timestamp && timestamp.seconds !== undefined) {
        date = new Date(timestamp.seconds * 1000);
      }
      else if (timestamp instanceof Date) {
        date = timestamp;
      }
      else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      }
      else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      }

      return date ? date.toLocaleDateString() : 'Invalid date';
    }
  },
  mounted() {
    this.fetchReports()
  }
}
</script>

<style scoped>
</style>
