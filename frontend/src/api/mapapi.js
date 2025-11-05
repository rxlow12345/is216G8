// Backend API base URL
// Support both localhost (via proxy) and cloud (via VITE_API_URL)
let API_BASE_URL = '/api'; // Default: relative path (uses Vite proxy in dev)

if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
  // Production: use full URL, check if /api is already included
  const viteUrl = import.meta.env.VITE_API_URL;
  if (viteUrl.endsWith('/api')) {
    API_BASE_URL = viteUrl;
  } else {
    API_BASE_URL = `${viteUrl}/api`;
  }
} else {
  // Localhost or no VITE_API_URL: use relative path (Vite proxy)
  API_BASE_URL = '/api';
}

const api = {
  async getReports(filters = {}) {
    const newUrl = new URL(`${API_BASE_URL}/reports/getAllReports`);
    if (filters && Object.keys(filters).length > 0) {
      const newSearchParams = new URLSearchParams(filters);
      newUrl.search = newSearchParams.toString();
    };

    const response = await fetch(newUrl.toString());
    if (!response.ok) {
      throw new Error('Network response was not ok while fetching reports.');
    };

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get reports from API.');
    }
    return result.data;
  },
  async getReport(id) {
    const newUrl = new URL(`${API_BASE_URL}/reports/getReport/${id}`);
    const response = await fetch(newUrl.toString());
    if (!response.ok) {
      throw new Error('Network response was not ok while fetching reports.');
    };

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get reports from API.');
    }
    return result.data;
  },
  async createReport(reportData) {
    const newUrl = new URL(`${API_BASE_URL}/reports`);
    const response = await fetch(newUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok while fetching reports.');
    };

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get reports from API.');
    }

    return result.data;
  },
  async updateReportStatus(id, status, assignedTo = null) {
    const newUrl = new URL(`${API_BASE_URL}/reports/updateReport/${id}`); // No function
    const response = await fetch(newUrl.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        assignedTo
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok while fetching reports.');
    };

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get reports from API.');
    }

    return result.data;
  },
  async deleteReport(id) {
    // return api.delete(`/reports/${id}`);
    const newUrl = new URL(`${API_BASE_URL}/reports/${id}`); // no function
    const response = await fetch(newUrl.toString(), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok while fetching reports.');
    };

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get reports from API.');
    }

    return result.data;
  },
  async getByGeoSpatial(lat, lng, radius = 10) {
    // return api.get('/reports', {
    //   params: { lat, lng, radius }
    // });
    const newUrl = new URL(`${API_BASE_URL}/reports/getByGeoSpatial`); // no function
    newUrl.searchParams.append('lat', lat);
    newUrl.searchParams.append('lng', lng);
    newUrl.searchParams.append('radius', radius);
    const response = await fetch(newUrl.toString());

    if (!response.ok) {
      throw new Error('Network response was not ok while fetching reports.');
    };

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get reports from API.');
    }

    return result.data;
  },
}

export default api;