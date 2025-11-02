<!-- frontend/src/pages/report/Report.vue -->
<template>
  <div class="container-fluid">
    <!-- Header with Logout -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-success mb-4">
      <div class="container">
        <span class="navbar-brand mb-0 h1">Wildlife Report System</span>
        <div class="navbar-nav ms-auto">
          <span class="navbar-text me-3">Welcome, {{ userEmail }}</span>
          <button class="btn btn-outline-light" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h3 class="card-title mb-0">
                <i class="bi bi-plus-circle"></i> Submit Wildlife Incident Report
              </h3>
            </div>
            <div class="card-body">
              <div class="alert alert-info" role="alert">
                <h5 class="alert-heading">Reporter Dashboard</h5>
                <p class="mb-0">
                  Use this form to report wildlife incidents. Your reports will be reviewed by administrators 
                  and assigned to volunteers for follow-up action.
                </p>
              </div>
              
              <!-- Report Form Instructions -->
              <div class="row">
                <div class="col-md-8">
                  <h5>How to Submit a Report:</h5>
                  <ol>
                    <li>Fill out the incident details form</li>
                    <li>Upload photos or videos if available</li>
                    <li>Provide accurate location information</li>
                    <li>Submit the report for review</li>
                  </ol>
                  
                  <div class="mt-4">
                    <h6>Report Types:</h6>
                    <ul>
                      <li><strong>Injured Animal:</strong> Animal appears hurt or sick</li>
                      <li><strong>Misplaced Animal:</strong> Animal in wrong location (e.g., urban area)</li>
                      <li><strong>Trapped Animal:</strong> Animal stuck or trapped</li>
                      <li><strong>Dead Animal:</strong> Deceased wildlife</li>
                      <li><strong>Other:</strong> Any other wildlife-related incident</li>
                    </ul>
                  </div>
                </div>
                
                <div class="col-md-4">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title">Emergency Contacts</h6>
                      <p class="card-text small">
                        <strong>For immediate threats to life:</strong><br>
                        Call <a href="tel:999" class="text-danger fw-bold">999</a> first
                      </p>
                      <p class="card-text small">
                        <strong>Wildlife Rescue:</strong><br>
                        <a href="tel:1800-476-1600">1800-476-1600</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="mt-4">
                <a href="/new_report/report.html" class="btn btn-success btn-lg me-3">
                  <i class="bi bi-plus-circle"></i> Create New Report
                </a>
                <a href="/pages/report.html" class="btn btn-outline-primary btn-lg">
                  <i class="bi bi-file-text"></i> Alternative Report Form
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { logout, getCurrentUser } from '../../api/auth.js';

// Reactive data
const userEmail = ref('');

// Router instance
const router = useRouter();

/**
 * Get current user info on component mount
 */
onMounted(async () => {
  try {
    const user = await getCurrentUser();
    if (user) {
      userEmail.value = user.username || user.email;
    }
  } catch (error) {
    console.error('Error getting user info:', error);
  }
});

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    await logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
    alert('Logout failed. Please try again.');
  }
}
</script>

<style scoped>
.navbar-brand {
  font-weight: bold;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.btn-success {
  background-color: #4CAF50;
  border-color: #4CAF50;
}

.btn-success:hover {
  background-color: #45a049;
  border-color: #45a049;
}

.alert-info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
}

.bi {
  margin-right: 0.5rem;
}
</style>
