<!-- frontend/src/pages/Login.vue -->
<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="text-center mb-4">Login</h2>
            
            <!-- Error Message -->
            <div v-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>
            
            <!-- Login Form -->
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="email"
                  required
                  placeholder="Enter your email"
                />
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  required
                  placeholder="Enter your password"
                />
              </div>
              
              <div class="d-grid">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? 'Signing in...' : 'Sign In' }}
                </button>
              </div>
            </form>
            
            <!-- Sign Up Link -->
            <div class="text-center mt-3">
              <p class="mb-0">
                Don't have an account? 
                <router-link to="/signup" class="text-decoration-none">Sign up here</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../api/auth.js';

// Reactive data
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

// Router instance
const router = useRouter();

/**
 * Handle login form submission
 */
async function handleLogin() {
  loading.value = true;
  error.value = '';
  
  try {
    const user = await login(email.value, password.value);
    
    // Redirect based on user role
    switch (user.role) {
      case 'admin':
        router.push('/status-update');
        break;
      case 'reporter':
        router.push('/report');
        break;
      case 'volunteer':
        router.push('/volunteer/home');
        break;
      default:
        router.push('/');
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.card {
  border: none;
  border-radius: 10px;
}

.btn-primary {
  background-color: #4CAF50;
  border-color: #4CAF50;
}

.btn-primary:hover {
  background-color: #45a049;
  border-color: #45a049;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
