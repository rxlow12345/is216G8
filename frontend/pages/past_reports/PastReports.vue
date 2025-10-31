<template>
  <div class="container-fluid p-0 past-reports-page">
    <!-- Top Banner -->
    <div id="topBanner">
      <header class="text-center mb-2">
        <h1>Past Wildlife Reports</h1>
        <!-- <p>Review and track all submitted wildlife incident reports</p> -->
      </header>
    </div>

    <!-- Search Bar -->
    <div class="search-section">
        <div class="search-bar">
            <input
                v-model="searchQuery"
                @input="filterReports"
                type="text"
                id="searchInput"
                placeholder="Search reports..."
            />
            <button @click="filterReports" id="searchBtn">Search</button>
        </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
        <select v-model="selectedSeverity" @change="filterReports" class="filter-select">
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="urgent">Urgent</option>
        </select>

        <select v-model="selectedStatus" @change="filterReports" class="filter-select">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
        </select>

        <select v-model="sortOption" @change="sortReports" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="severityHigh">Severity (High → Low)</option>
            <option value="severityLow">Severity (Low → High)</option>
        </select>
    </div>

    <!-- Reports Grid -->
    <div id="reportsContainer">
      <p v-if="filteredReports.length === 0" class="text-center text-muted mt-4">
        No matching reports found.
      </p>

      <div
        v-for="report in paginatedReports"
        :key="report.id"
        class="report-card"
        @click="viewReport(report)"
      >
        <img
          v-if="report.photoURLs && report.photoURLs.length"
          :src="report.photoURLs[0]"
          alt="Report image"
        />
        <div class="report-body">
          <h5>{{ report.speciesName || 'Unknown Species' }}</h5>
          <p><strong>Severity:</strong> {{ report.severity }}</p>
          <p><strong>Status:</strong> {{ report.status }}</p>
          <p><strong>Date:</strong> {{ formatDate(report.createdAt) }}</p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      id="pagination"
      v-show="filteredReports.length > reportsPerPage"
      class="pagination-buttons d-flex justify-content-center align-items-center mt-4"
    >
      <button @click="prevPage" :disabled="currentPage === 1">‹ Prev</button>
      <span id="pageIndicator">Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next ›</button>
    </div>

    <!-- Report Detail View -->
    <div v-if="selectedReport" class="report-detail p-4">
      <button class="btn btn-outline-success mb-3" @click="selectedReport = null">← Back</button>
      <h2>{{ selectedReport.speciesName || 'Unknown Species' }}</h2>
      <p><strong>Severity:</strong> {{ selectedReport.severity }}</p>
      <p><strong>Status:</strong> {{ selectedReport.status }}</p>
      <p><strong>Description:</strong> {{ selectedReport.description }}</p>
      <p><strong>Location:</strong> {{ selectedReport.location }}</p>

      <div class="photo-gallery mt-3">
        <img
          v-for="(url, index) in selectedReport.photoURLs"
          :key="index"
          :src="url"
          class="photo-preview"
          alt="Report image"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import '../css/pastReports.css'

export default {
  name: 'PastReports',
  data() {
    return {
      reports: [],
      filteredReports: [],
      selectedReport: null,
      searchQuery: '',
      selectedSeverity: '',
      selectedStatus: '',
      sortOption: 'newest',
      currentPage: 1,
      reportsPerPage: 9
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredReports.length / this.reportsPerPage)
    },
    paginatedReports() {
      const start = (this.currentPage - 1) * this.reportsPerPage
      return this.filteredReports.slice(start, start + this.reportsPerPage)
    }
  },
  methods: {
    async fetchReports() {
      try {
        const res = await axios.get('/api/reports')
        this.reports = res.data.data
        this.filteredReports = this.reports
      } catch (err) {
        console.error('Failed to fetch reports:', err)
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
      this.currentPage = 1
    },
    sortReports() {
      if (this.sortOption === 'newest') {
        this.filteredReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      } else if (this.sortOption === 'oldest') {
        this.filteredReports.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      } else if (this.sortOption === 'severityHigh') {
        const order = { urgent: 3, moderate: 2, low: 1 }
        this.filteredReports.sort((a, b) => (order[b.severity] || 0) - (order[a.severity] || 0))
      } else if (this.sortOption === 'severityLow') {
        const order = { urgent: 3, moderate: 2, low: 1 }
        this.filteredReports.sort((a, b) => (order[a.severity] || 0) - (order[b.severity] || 0))
      }
    },
    viewReport(report) {
      this.selectedReport = report
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--
    },
    formatDate(timestamp) {
      return new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp)
        .toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' })
    }
  },
  mounted() {
    this.fetchReports()
  }
}
</script>

<style scoped>
</style>