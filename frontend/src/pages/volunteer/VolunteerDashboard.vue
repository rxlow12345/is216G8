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
              
              <!-- Volunteer Dashboard Content -->
              <div class="text-center py-5">
                <h4>Volunteer Dashboard</h4>
                <p class="text-muted">Welcome to your volunteer portal. Features coming soon!</p>
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
      userEmail.value = user.email;
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
