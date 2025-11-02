<!-- frontend/src/pages/volunteer/Home.vue -->
<template>
  <div class="container-fluid">
    <!-- Header with Logout -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-warning mb-4">
      <div class="container">
        <span class="navbar-brand mb-0 h1">Volunteer Dashboard</span>
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
            <div class="card-header bg-warning text-dark">
              <h3 class="card-title mb-0">
                <i class="bi bi-people"></i> Volunteer Portal
              </h3>
            </div>
            <div class="card-body">
              <div class="alert alert-warning" role="alert">
                <h5 class="alert-heading">Welcome, Volunteer!</h5>
                <p class="mb-0">
                  This is your volunteer dashboard. Here you can view assigned tasks, 
                  update report statuses, and manage your volunteer activities.
                </p>
              </div>
              
              <!-- Volunteer Information -->
              <div class="row">
                <div class="col-md-8">
                  <h5>Your Role as a Volunteer:</h5>
                  <ul>
                    <li>Respond to wildlife incident reports</li>
                    <li>Update report statuses (In Progress, Resolved, etc.)</li>
                    <li>Communicate with reporters about incident updates</li>
                    <li>Coordinate with other volunteers and administrators</li>
                  </ul>
                  
                  <div class="mt-4">
                    <h6>Available Actions:</h6>
                    <div class="row">
                      <div class="col-md-6">
                        <div class="card bg-light mb-3">
                          <div class="card-body">
                            <h6 class="card-title">View Reports</h6>
                            <p class="card-text small">Browse and manage wildlife incident reports</p>
                            <a href="/status-update" class="btn btn-sm btn-primary">Go to Reports</a>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="card bg-light mb-3">
                          <div class="card-body">
                            <h6 class="card-title">Submit Report</h6>
                            <p class="card-text small">Create a new wildlife incident report</p>
                            <router-link to="/new-report" class="btn btn-sm btn-success">Create Report</router-link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-4">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title">Quick Stats</h6>
                      <p class="card-text small">
                        <strong>Your Status:</strong> Active Volunteer<br>
                        <strong>Role:</strong> Wildlife Response<br>
                        <strong>Access Level:</strong> Report Management
                      </p>
                      <hr>
                      <h6 class="card-title">Emergency Contacts</h6>
                      <p class="card-text small">
                        <strong>Wildlife Rescue:</strong><br>
                        <a href="tel:1800-476-1600">1800-476-1600</a><br>
                        <strong>Emergency:</strong><br>
                        <a href="tel:999" class="text-danger fw-bold">999</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Placeholder for future features -->
              <div class="mt-4">
                <div class="card border-info">
                  <div class="card-header bg-info text-white">
                    <h6 class="mb-0">Coming Soon</h6>
                  </div>
                  <div class="card-body">
                    <p class="card-text">
                      Additional volunteer features will be added here, including:
                    </p>
                    <ul class="mb-0">
                      <li>Task assignment system</li>
                      <li>Volunteer scheduling</li>
                      <li>Progress tracking</li>
                      <li>Communication tools</li>
                    </ul>
                  </div>
                </div>
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

.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #000;
}

.btn-warning:hover {
  background-color: #e0a800;
  border-color: #d39e00;
  color: #000;
}

.alert-warning {
  background-color: #fff3cd;
  border-color: #ffeaa7;
  color: #856404;
}

.bi {
  margin-right: 0.5rem;
}
</style>
