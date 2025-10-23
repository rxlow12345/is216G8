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
                  :class="{ 'is-invalid': emailBlurred && !isValidEmail(email) }"
                  id="email"
                  v-model="email"
                  required
                  placeholder="Enter your email"
                  autocomplete="off"
                  @focus="emailFocused = true"
                  @blur="emailBlurred = true"
                />
                <div v-if="emailBlurred && !isValidEmail(email)" class="invalid-feedback" style="display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem;">
                  Please enter a valid email address
                </div>
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <div class="input-group">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': passwordBlurred && password.length < 6 }"
                    id="password"
                    v-model="password"
                    required
                    placeholder="Enter your password"
                    minlength="6"
                    autocomplete="new-password"
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
                <div v-if="passwordBlurred && password.length < 6" class="invalid-feedback" style="display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem;">
                  Password must be at least 6 characters long
                </div>
                <div v-else-if="!passwordBlurred" class="form-text">Password must be at least 6 characters long.</div>
              </div>
              
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm Password</label>
                <div class="input-group">
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': confirmPasswordBlurred && password !== confirmPassword }"
                    id="confirmPassword"
                    v-model="confirmPassword"
                    required
                    placeholder="Confirm your password"
                    autocomplete="new-password"
                    @focus="confirmPasswordFocused = true"
                    @blur="confirmPasswordBlurred = true"
                  />
                  <button
                    class="password-toggle-btn"
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    :title="showConfirmPassword ? 'Hide password' : 'Show password'"
                  >
                    <svg v-if="showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <div v-if="confirmPasswordBlurred && password !== confirmPassword" class="invalid-feedback" style="display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem;">
                  Passwords do not match
                </div>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { signup } from '../../api/auth.js';

// Reactive data
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const role = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');
const emailFocused = ref(false);
const emailBlurred = ref(false);
const passwordFocused = ref(false);
const passwordBlurred = ref(false);
const confirmPasswordFocused = ref(false);
const confirmPasswordBlurred = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Router instance
const router = useRouter();

/**
 * Clear all form data and reset states
 */
function clearFormData() {
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
  role.value = '';
  loading.value = false;
  error.value = '';
  success.value = '';
  emailFocused.value = false;
  emailBlurred.value = false;
  passwordFocused.value = false;
  passwordBlurred.value = false;
  confirmPasswordFocused.value = false;
  confirmPasswordBlurred.value = false;
  showPassword.value = false;
  showConfirmPassword.value = false;
}

/**
 * Clear form data when component mounts
 */
onMounted(() => {
  clearFormData();
  
  // Additional clearing after a short delay to handle browser autofill
  setTimeout(() => {
    clearFormData();
  }, 100);
});

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
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Handle signup form submission
 */
async function handleSignup() {
  // Clear previous messages
  error.value = '';
  success.value = '';
  
  // Validate email format
  if (!email.value.trim()) {
    error.value = 'Email is required';
    return;
  }
  
  if (!isValidEmail(email.value)) {
    error.value = 'Please enter a valid email address';
    return;
  }
  
  // Validate password length
  if (!password.value) {
    error.value = 'Password is required';
    return;
  }
  
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters long';
    return;
  }
  
  // Validate passwords match
  if (!confirmPassword.value) {
    error.value = 'Please confirm your password';
    return;
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }
  
  // Validate role selection
  if (!role.value) {
    error.value = 'Please select your role';
    return;
  }
  
  loading.value = true;
  
  try {
    await signup(email.value, password.value, role.value);
    success.value = 'Account created successfully! Redirecting to login...';
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login');
    }, 2000);
    
  } catch (err) {
    // Handle Firebase auth errors
    if (err.message.includes('email-already-in-use')) {
      error.value = 'This email is already registered. Please use a different email or try logging in.';
    } else if (err.message.includes('weak-password')) {
      error.value = 'Password is too weak. Please choose a stronger password.';
    } else if (err.message.includes('invalid-email')) {
      error.value = 'Please enter a valid email address.';
    } else {
      error.value = err.message;
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
