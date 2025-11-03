<!-- frontend/src/pages/Signup.vue -->
<template>
  <div class="wrapper">
    <!-- Floating Animals Background -->
    <FloatingBackground/>

    <OtterCursor animal="🦦" :speed="0.08"/>

    <div class="loginContainer">
      <div class="auth-card">
        <!-- Header with Logo -->
        <div class="header">
          <div class="logo">
            <span class="logo-icon">🐾</span>
            <span class="logo-icon">🦊</span>
          </div>
          <h2 class="title">CritterConnect</h2>
          <p class="subtitle">Join our wildlife community</p>
        </div>
        
        <!-- Error Message -->
        <transition name="slide-fade">
          <div v-if="error" class="alert alert-danger" role="alert">
            ⚠️ {{ error }}
          </div>
        </transition>
        
        <!-- Success Message -->
        <transition name="slide-fade">
          <div v-if="success" class="alert alert-success" role="alert">
            ✅ {{ success }}
          </div>
        </transition>
        
        <!-- Signup Form -->
        <form @submit.prevent="handleSignup" autocomplete="off">
          <!-- Hidden dummy fields to confuse browser autofill -->
          <input type="email" style="display: none;" autocomplete="off" />
          <input type="password" style="display: none;" autocomplete="off" />
          <input type="password" style="display: none;" autocomplete="off" />
          
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': usernameBlurred && username.length < 3 && username.length > 0 }"
                id="username"
                v-model="username"
                required
                placeholder="Enter your username"
                autocomplete="username"
                @focus="usernameFocused = true"
                @blur="usernameBlurred = true"
              />
            </div>
            <div v-if="usernameBlurred && username.length < 3 && username.length > 0" class="field-error">
              Username must be at least 3 characters long
            </div>
            <div v-else class="form-text">Choose a username (at least 3 characters).</div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <div class="input-wrapper">
              <span class="input-icon">✉️</span>
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
            </div>
            <div v-if="emailBlurred && !isValidEmail(email)" class="field-error">
              Please enter a valid email address
            </div>
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': passwordBlurred && password.length < 6 && password.length > 0 }"
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
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <div v-if="passwordBlurred && password.length < 6 && password.length > 0" class="field-error">
              Password must be at least 6 characters long
            </div>
            <div v-else class="form-text">Password must be at least 6 characters long.</div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <div class="input-wrapper">
              <span class="input-icon">🔐</span>
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': confirmPasswordBlurred && password !== confirmPassword && confirmPassword.length > 0 }"
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
                {{ showConfirmPassword ? '👁️‍🗨️' : '👁️' }}
              </button>
            </div>
            <div v-if="confirmPasswordBlurred && password !== confirmPassword && confirmPassword.length > 0" class="field-error">
              Passwords do not match
            </div>
          </div>
          
          <div class="d-grid">
            <button 
              type="submit" 
              class="btn green-btn-lg"
              :disabled="loading || !isFormValid"
            >
              <span v-if="loading" class="spinner"></span>
              <span v-else>🦊 {{ loading ? 'Creating Account...' : 'Create Account' }}</span>
            </button>
          </div>
        </form>
        
        <!-- Login Link -->
        <div class="text-center mt-3">
          <p class="login-text">
            Already have an account? 
            <router-link to="/login" class="login-link">Login here</router-link>
          </p>
        </div>

        <!-- Footer Critters -->
        <div class="footer-critters">
          <span class="critter">🦝</span>
          <span class="critter">🐿️</span>
          <span class="critter">🦔</span>
          <span class="critter">🦉</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { signup } from '../../src/api/auth.js';
import OtterCursor from '../../src/components/OtterCursor.vue';
import FloatingBackground from '../../src/components/FloatingBackground.vue';
import '../css/common.css'
import '../css/login.css'
import confetti from 'canvas-confetti';

// Reactive data
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const role = ref('reporter'); // Always set to reporter
const loading = ref(false);
const error = ref('');
const success = ref('');
const usernameFocused = ref(false);
const usernameBlurred = ref(false);
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
  username.value = '';
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
  role.value = 'reporter';
  loading.value = false;
  error.value = '';
  // Don't clear success message - let it persist
  usernameFocused.value = false;
  usernameBlurred.value = false;
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
  
  // More aggressive clearing to handle persistent browser autofill
  const clearIntervals = [50, 100, 200, 500, 1000, 2000];
  
  clearIntervals.forEach(delay => {
    setTimeout(() => {
      clearFormData();
    }, delay);
  });
});

/**
 * Computed property to validate form
 */
const isFormValid = computed(() => {
  return username.value && 
         username.value.length >= 3 &&
         email.value && 
         password.value && 
         confirmPassword.value && 
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
  
  // Validate username
  if (!username.value.trim()) {
    error.value = 'Username is required';
    return;
  }
  
  if (username.value.length < 3) {
    error.value = 'Username must be at least 3 characters long';
    return;
  }
  
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
  
  loading.value = true;
  
  try {
    await signup(username.value, email.value, password.value, role.value);
    success.value = 'Account created successfully! Redirecting to login...';

    celebrateSignup();
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login');
    }, 2000);
    
  } catch (err) {
    // Handle Firebase auth errors and custom validation errors
    if (err.message.includes('email-already-in-use') || err.message.includes('An account already exists with this email address')) {
      error.value = 'An account already exists with this email address. Please use a different email or try logging in.';
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

function celebrateSignup() {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  confetti({ particleCount: 50, spread: 120, origin: { y: 0.7 } });
}
</script>

<style scoped>
/* Auth Card */
.auth-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.5s;
}

.auth-card:hover {
  transform: translateY(-5px);
}

/* Alert Messages - Made MORE VISIBLE */
.alert-danger {
  background: rgba(220, 38, 38, 0.9) !important;
  border: 2px solid #ef4444 !important;
  color: black !important;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

.alert-success {
  background: rgba(5, 150, 105, 0.9) !important;
  border: 2px solid #10b981 !important;
  color: #285436 !important;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.form-label {
  display: block;
  color: #285436;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

/* Input Wrapper */
.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  opacity: 0.7;
  z-index: 1;
}

/* Form Control */
.form-control {
  width: 100%;
  padding: 14px 50px 14px 44px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid  #285436;
  border-radius: 12px;
  color: black;
  font-size: 15px;
  transition: all 0.3s;
  outline: none;
}

.form-control::placeholder {
  color: #285436;
}

.form-control:focus {
  background: rgba(255, 255, 255, 0.12);
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  transform: translateY(-2px);
}

.form-control.is-invalid {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1);
}

/* Field-level Error Messages */
.field-error {
  color: #ef4444;
  font-size: 13px;
  margin-top: 6px;
  font-weight: 500;
}

/* Form Helper Text */
.form-text {
  font-size: 12px;
  color: #606C38;
  margin-top: 6px;
  display: block;
}

/* Password Toggle Button */
.password-toggle-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s;
  padding: 4px;
  z-index: 1;
}

.password-toggle-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  transform: translateY(-50%) scale(1.1);
}

/* Submit Button */
.d-grid {
  margin-top: 24px;
}

.green-btn-lg {
  width: 100%;
  padding: 16px 32px;
  border-radius: 15px;
  background-color: #285436;
  color: rgb(254, 250, 224);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.green-btn-lg:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(16, 185, 129, 0.4);
  background-color: #606C38;
  color: #fff;
  border: 1px solid #285436;
}

.green-btn-lg:active:not(:disabled) {
  transform: translateY(0);
}

.green-btn-lg:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Login Text */
.text-center {
  text-align: center;
}

.mt-3 {
  margin-top: 1.5rem;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-text {
  background-color: rgb(254, 250, 224);
  border: 1px solid #285436;
  border-radius: 12px;
  color: #285436;
  font-size: 15px;
  padding: 5px;
  margin: 0;
  font-weight: 500;
}

.login-link {
  color: #34d399;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s;
  font-size: 16px;
}

.login-link:hover {
  color: #6ee7b7;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-card {
    padding: 32px 24px;
  }

  h2 {
    font-size: 28px;
  }

  .logo {
    font-size: 40px;
  }
}
</style>