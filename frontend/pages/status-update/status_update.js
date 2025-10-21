import { getDatabase, ref, get } from "firebase/database";

// Backend API configuration, automatically detect environment
// if in production, frontend and backend would host together whereas development would separate
// Check if we are running the app locally (on our own computer)
const isDevelopment =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

// If we are in development (local testing):
// → use the backend that runs on port 4100 (your Express server)
// Otherwise (in production):
// → use the same domain as the website
const API_BASE_URL = isDevelopment
    ? `${window.location.protocol}//${window.location.hostname}:4100/api`
    : '/api';


// js/status_update.js
const { createApp, ref, computed, onMounted, watch } = Vue;

// --- API Helper Functions ---
const api = {
    async getAllReports() {
        const response = await fetch(`${API_BASE_URL}/reports`);
        if (!response.ok) throw new Error('Failed to fetch reports.');
        const result = await response.json();
        return result.data;
    },
    async updateReportStatus(id, status) {
        const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        });
        if (!response.ok) throw new Error('Failed to update status.');
        return await response.json();
    }
};
