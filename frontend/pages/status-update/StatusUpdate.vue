<!-- src/components/StatusUpdate.vue -->

<script>
import api from '../../src/api/reportApi.js';

export default {
  name: 'StatusUpdate',

  data() {
    return {
      reports: [],
      isLoading: true,
      error: null
    };
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
        // Optimistic UI update: Change status locally for instant feedback
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
          report.status = newStatus;
        }

        // Now, send the update to the server
        await api.updateReportStatus(reportId, newStatus);
        
        // Optional: You can re-fetch to ensure data consistency, but the
        // optimistic update above often provides a better user experience.
        // await this.fetchReports();

      } catch (e) {
        console.error('Failed to update status:', e);
        alert('Failed to update the report status. Please check the console.');
        // If the API call failed, revert the optimistic update
        await this.fetchReports();
      }
    }
  },

  mounted() {
    this.fetchReports();
  }
};
</script>

<template>
  <div class="status-updater">
    <h1>Status Updates</h1>

    <div v-if="isLoading" class="loading-state">
      <p>Loading reports...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>Sorry, an error occurred while fetching data:</p>
      <pre>{{ error }}</pre>
    </div>

    <ul v-else-if="reports.length > 0" class="report-list">
      <!-- 2. CORRECTED: Using real data fields like 'speciesName', 'reportId', and 'status' -->
      <li v-for="report in reports" :key="report.id">
        <div class="report-info">
          <span><strong>{{ report.speciesName }}</strong> ({{ report.reportId }})</span>
          <small>Current Status: <strong>{{ report.status }}</strong></small>
        </div>
        <div class="report-actions">
          <!-- The @click handler calls the method from the `methods` object -->
          <button @click="handleStatusChange(report.id, 'in-progress')">Start Progress</button>
          <button @click="handleStatusChange(report.id, 'resolved')">Mark Resolved</button>
        </div>
      </li>
    </ul>

    <div v-else class="empty-state">
      <p>No reports found.</p>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles ensure they only apply to this component */
.status-updater {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: sans-serif;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}
.error-message {
  color: #d8000c;
  background-color: #ffbaba;
  border: 1px solid #d8000c;
  padding: 1rem;
  border-radius: 4px;
}
.report-list {
  list-style: none;
  padding: 0;
}
.report-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}
.report-list li:last-child {
  border-bottom: none;
}
.report-info {
  display: flex;
  flex-direction: column;
}
.report-info small {
  color: #555;
}
.report-actions button {
  margin-left: 0.5rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  background-color: #fff;
}
.report-actions button:hover {
  background-color: #f0f0f0;
}
</style>