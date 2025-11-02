<template>
  <div class="container-fluid p-0 userReportsPage">
    <!-- Top Banner -->
    <div id="topBanner" class="bannerTitles">
      <header class="text-center mb-2">
        <h1>Your Wildlife Reports</h1>
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

      <!-- Reports List -->
      <div id="reportsContainer" class="reportsContainer">
        <p v-if="filteredReports.length === 0" class="noResults">
          You have no reports to display.
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
                <span class="reportSubtitle"> ({{ report.reportId || 'Unknown ID' }})</span>
              </div>
              
              <!-- Button to View Status -->
              <router-link :to="'/status/' + report.reportId">
                <button class="viewStatusButton">View Status</button>
              </router-link>
            </div>
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

export default {
  name: 'UserReports',
  data() {
    return {
      reports: [],
      filteredReports: [],
      expandedReport: null,
      isLoading: true,
      error: null,
      userUid: '',
      searchQuery: '',
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

        // Fetch all reports from the API
        const allReports = await api.getAllReports()

        // Filter reports based on user UID
        this.reports = allReports.filter(r => r.uid === this.userUid)
        this.filteredReports = [...this.reports]
      }
      catch (err) {
        console.error('Failed to fetch reports:', err)
        this.error = err.message || 'Failed to fetch reports.'
      }
      finally {
        this.isLoading = false
      }
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
    },
    filterReports() {
      const query = this.searchQuery.trim().toLowerCase();

      if (!query) {
        // If the search query is empty, show all reports
        this.filteredReports = [...this.reports];
      } else {
        // Filter reports by species name or report ID
        this.filteredReports = this.reports.filter(report => {
          const speciesName = report.speciesName ? report.speciesName.toLowerCase() : '';
          const reportId = report.reportId ? report.reportId.toString().toLowerCase() : '';

          return speciesName.includes(query) || reportId.includes(query);
        });
      }
    },
    handleSearchButtonClick() {
      if (this.searchQuery) {
        this.searchQuery = ''
        this.filterReports()
      }
      else {
        this.filterReports()
      }
    }
  },
  mounted() {
    this.fetchReports()
  }
}
</script>

<style scoped>
.userReportsPage {
  background-color: #FEFAE0;
  min-height: 100vh;
  color: #283618;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.searchSection {
  margin-bottom: 30px;
}

.reportTitle {
  display: flex;
  flex-direction: column;
}

.reportSubtitle {
  color: #aaa;
}

.viewStatusButton {
  padding: 8px 16px;
  background-color: #DDA15E;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  width: 120px;
}

.viewStatusButton:hover {
  background-color: #BC6C25;
}
</style>
