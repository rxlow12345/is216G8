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
   * Updates one or more fields of a specific report.
   * @param {string} reportId - The ID of the report to update.
   * @param {Object} updates - An object containing the fields to update, e.g., { status: 'approved', priority: 'high' }.
   * @returns {Promise<Object>} A promise that resolves to the API response.
   */
  async updateReportFields(reportId, updates) {
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('At least one field must be provided to update.');
    }

    const response = await fetch(`${API_BASE_URL}/reports/updateReportFields/${reportId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok while updating report.');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to update report via API.');
    }

    return result;
  },

  /**
   * Fetches a single report by its Firebase ID.
   * @param {string} firebaseId - The ID of the report to fetch.
   * @returns {Promise<Object>} A promise that resolves to the report object.
   */
  async getReportById(firebaseId) {
    const response = await fetch(`${API_BASE_URL}/reports/getReport/docId/${firebaseId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok while fetching the report.');
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get report from API.');
    }
    return result.data;
  },
  /**
   * Fetches a single report by its report ID.
   * @param {string} reportId - The report ID of the report to fetch.
   * @returns {Promise<Object>} A promise that resolves to the report object.
   */
  async getReportByReportId(reportId) {
    const response = await fetch(`${API_BASE_URL}/reports/getReport/reportId/${reportId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok while fetching the report.');
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get report from API.');
    }
    return result.data;
  },
  /**
   * Gets the summary details of active report
   * @param {string} reportId - The report ID of the report to fetch.
   * @returns {Promise<Object>} A promise that resolves to the report object.
   */
  async getActiveSummary(reportId) {
    const response = await fetch(`${API_BASE_URL}/reports/getReport/activeSummary/${reportId}`);
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