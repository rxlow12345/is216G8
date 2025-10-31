<!-- frontend/src/pages/report/Report.vue -->
<template>
  <div class="container-fluid">
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
              
              <!-- Action Button -->
              <div class="text-center py-4">
                <a href="new_report/report.html" class="btn btn-success btn-lg">
                  <i class="bi bi-plus-circle"></i> Create Wildlife Report
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
import { logout, getCurrentUser } from '../../src/api/auth.js';

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
