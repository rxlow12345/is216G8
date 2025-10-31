<!-- frontend/src/pages/volunteer/Home.vue -->
<template>
  <div class="container-fluid">
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
import { logout, checkUserAuthAndRole } from '../../src/api/auth.js';

// Reactive data
const userEmail = ref('');
const currentUser = ref(null);

// Router instance
const router = useRouter();

/**
 * Check user authentication and role on component mount
 */
onMounted(async () => {
  // Use the utility function for cleaner code
  await checkUserAuthAndRole(router, 'volunteer', { userEmail, currentUser });
});
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
