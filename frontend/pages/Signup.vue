<!-- frontend/src/pages/Signup.vue -->
<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="text-center mb-4">Sign Up</h2>
            
            <!-- Error Message -->
            <div v-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>
            
            <!-- Success Message -->
            <div v-if="success" class="alert alert-success" role="alert">
              {{ success }}
            </div>
            
            <!-- Signup Form -->
            <form @submit.prevent="handleSignup">
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
                  minlength="6"
                />
                <div class="form-text">Password must be at least 6 characters long.</div>
              </div>
              
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="confirmPassword"
                  v-model="confirmPassword"
                  required
                  placeholder="Confirm your password"
                />
              </div>
              
              <div class="mb-3">
                <label for="role" class="form-label">Role</label>
                <select class="form-select" id="role" v-model="role" required>
                  <option value="">Select your role</option>
                  <option value="reporter">Reporter</option>
                  <option value="volunteer">Volunteer</option>
                </select>
                <div class="form-text">Choose your role in the wildlife reporting system.</div>
              </div>
              
              <div class="d-grid">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="loading || !isFormValid"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? 'Creating Account...' : 'Sign Up' }}
                </button>
              </div>
            </form>
            
            <!-- Login Link -->
            <div class="text-center mt-3">
              <p class="mb-0">
                Already have an account? 
                <router-link to="/login" class="text-decoration-none">Login here</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { signup } from '../api/auth.js';

// Reactive data
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const role = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

// Router instance
const router = useRouter();

/**
 * Computed property to validate form
 */
const isFormValid = computed(() => {
  return email.value && 
         password.value && 
         confirmPassword.value && 
         role.value && 
         password.value === confirmPassword.value &&
         password.value.length >= 6;
});

/**
 * Handle signup form submission
 */
async function handleSignup() {
  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }
  
  // Validate password length
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters long';
    return;
  }
  
  loading.value = true;
  error.value = '';
  success.value = '';
  
  try {
    await signup(email.value, password.value, role.value);
    success.value = 'Account created successfully! Redirecting to login...';
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login');
    }, 2000);
    
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

.btn-primary:disabled {
  background-color: #cccccc;
  border-color: #cccccc;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.form-text {
  font-size: 0.875rem;
  color: #6c757d;
}
</style>
