// Backend API configuration, automatically detect environment
// This logic is perfect for this file.
const isDevelopment =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment
    ? `${window.location.protocol}//${window.location.hostname}:4100/api`
    : '/api';

// --- API Helper Functions ---

/**
 * An object that centralizes all your API communication logic.
 */
const api = {
  /**
   * Fetches all reports from the backend.
   * @returns {Promise<Array>} A promise that resolves to an array of report objects.
   */
  async getAllReports() {
    const response = await fetch(`${API_BASE_URL}/reports/getAllReports`);
    if (!response.ok) {
      throw new Error('Network response was not ok while fetching reports.');
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get reports from API.');
    }
    return result.data;
  },

  /**
   * Updates the status of a specific report.
   * @param {string} reportId - The ID of the report to update.
   * @param {string} status - The new status (e.g., 'approved', 'rejected').
   * @returns {Promise<Object>} A promise that resolves to the success message from the API.
   */
  async updateReportStatus(reportId, status) {
    const response = await fetch(`${API_BASE_URL}/reports/updateReport/${reportId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: status }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok while updating status.');
    }
    const result = await response.json();
     if (!result.success) {
      throw new Error(result.message || 'Failed to update status via API.');
    }
    return result;
  },
  /**
   * Fetches a single report by its ID.
   * @param {string} reportId - The ID of the report to fetch.
   * @returns {Promise<Object>} A promise that resolves to the report object.
   */
  async getReportById(reportId) {
    const response = await fetch(`${API_BASE_URL}/reports/getReport/${reportId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok while fetching the report.');
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get report from API.');
    }
    return result.data;
  },
};



export default api;