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
            <form @submit.prevent="handleLogin" autocomplete="off">
              <!-- Hidden dummy fields to confuse browser autofill -->
              <input type="email" style="display: none;" autocomplete="off" />
              <input type="password" style="display: none;" autocomplete="off" />
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': email && emailBlurred && !isValidEmail(email) }"
                  id="email"
                  v-model="email"
                  required
                  placeholder="Enter your email"
                  autocomplete="new-password"
                  data-form-type="other"
                  @focus="emailFocused = true"
                  @blur="emailBlurred = true"
                />
                <div v-if="email && emailBlurred && !isValidEmail(email)" class="invalid-feedback">
                  Please enter a valid email address
                </div>
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <div class="input-group">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    id="password"
                    v-model="password"
                    required
                    placeholder="Enter your password"
                    autocomplete="new-password"
                    data-form-type="other"
                    @focus="passwordFocused = true"
                    @blur="passwordBlurred = true"
                  />
                  <button
                    class="password-toggle-btn"
                    type="button"
                    @click="showPassword = !showPassword"
                    :title="showPassword ? 'Hide password' : 'Show password'"
                  >
                    <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../../api/auth.js';

// Reactive data
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const emailFocused = ref(false);
const emailBlurred = ref(false);
const passwordFocused = ref(false);
const passwordBlurred = ref(false);
const showPassword = ref(false);

// Router instance
const router = useRouter();

/**
 * Clear all form data and reset states
 */
function clearFormData() {
  email.value = '';
  password.value = '';
  loading.value = false;
  error.value = '';
  emailFocused.value = false;
  emailBlurred.value = false;
  passwordFocused.value = false;
  passwordBlurred.value = false;
  showPassword.value = false;
}

/**
 * Clear form data when component mounts
 */
onMounted(() => {
  clearFormData();
  
  // More aggressive clearing to handle persistent browser autofill
  const clearIntervals = [50, 100, 200, 500, 1000, 2000];
  
  clearIntervals.forEach(delay => {
    setTimeout(() => {
      clearFormData();
    }, delay);
  });
  
  // Also clear on window focus (when user returns to tab)
  window.addEventListener('focus', clearFormData);
  
  // Clean up listener on unmount
  return () => {
    window.removeEventListener('focus', clearFormData);
  };
});

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Handle login form submission
 */
async function handleLogin() {
  // Clear previous error
  error.value = '';
  
  // Validate email format
  if (!email.value.trim()) {
    error.value = 'Email is required';
    return;
  }
  
  if (!isValidEmail(email.value)) {
    error.value = 'Please enter a valid email address';
    return;
  }
  
  // Validate password
  if (!password.value) {
    error.value = 'Password is required';
    return;
  }
  
  loading.value = true;
  
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
    // Handle Firebase auth errors
    if (err.message.includes('user-not-found')) {
      error.value = 'No account found with this email address. Please check your email or sign up for a new account.';
    } else if (err.message.includes('wrong-password')) {
      error.value = 'Incorrect password. Please try again.';
    } else if (err.message.includes('invalid-email')) {
      error.value = 'Please enter a valid email address.';
    } else if (err.message.includes('invalid-credential')) {
      error.value = 'Invalid email or password. Please check your credentials and try again.';
    } else if (err.message.includes('too-many-requests')) {
      error.value = 'Too many failed login attempts. Please try again later.';
    } else if (err.message.includes('user-disabled')) {
      error.value = 'This account has been disabled. Please contact support.';
    } else {
      error.value = 'Login failed. Please check your email and password and try again.';
    }
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

.password-toggle-btn {
  border: none;
  border-left: 1px solid #ced4da;
  background-color: #ffffff;
  color: #6c757d;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
}

.password-toggle-btn:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.password-toggle-btn:focus {
  box-shadow: none;
  outline: none;
  background-color: #f8f9fa;
}

.input-group .form-control:focus {
  border-right: none;
  box-shadow: none;
}

.input-group .form-control:focus + .password-toggle-btn {
  border-color: #86b7fe;
}
</style>
