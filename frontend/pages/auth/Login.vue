<!-- frontend/src/pages/Login.vue -->
<template>
  <FloatingBackground/>
  <OtterCursor animal="🦦" :speed="0.08"/>
  <div class="wrapper">
    <div class="loginContainer">
      <div class="auth-card">
        <!-- Header with Logo -->
        <div class="header">
          <div class="logo">
            <span class="logo-icon">🐾</span>
            <span class="logo-icon">🦊</span>
          </div>
          <h2 class="title">CritterConnect</h2>
          <p class="subtitle">Welcome back to nature</p>
        </div>
        
        <!-- Error Message -->
        <transition name="slide-fade">
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
        </transition>
        
        <!-- Login Form -->
        <form @submit.prevent="handleLogin" autocomplete="off">
          <!-- Hidden dummy fields to confuse browser autofill -->
          <input type="email" style="display: none;" autocomplete="off" />
          <input type="password" style="display: none;" autocomplete="off" />
          
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <div class="input-wrapper">
              <span class="input-icon">✉️</span>
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
            </div>
            <div v-if="email && emailBlurred && !isValidEmail(email)" class="invalid-feedback">
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
                {{ showPassword ? '👁️‍🗨️' : '👁️' }}
              </button>
            </div>
          </div>
          
          <div class="d-grid">
            <button 
              type="submit" 
              class="btn green-btn-lg"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner"></span>
              <span v-else>{{ loading ? 'Logging in...' : 'Log In' }}</span>
            </button>
          </div>
        </form>
        
        <!-- Sign Up Link -->
        <div class="text-center mt-3">
          <p class="signup-text">
            Don't have an account? 
            <router-link to="/signup" class="signup-link">Sign up here</router-link>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { login, getCurrentUser } from '../../src/api/auth.js';
import confetti from 'canvas-confetti';
import '../css/common.css'
import '../css/login.css'
import OtterCursor from '../../src/components/OtterCursor.vue';
import FloatingBackground from '../../src/components/FloatingBackground.vue';

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

    celebrateLogin();
    
    // Verify user is available before navigating (this ensures Firebase auth state is ready)
    const verifiedUser = await getCurrentUser();
    
    if (!verifiedUser) {
      error.value = 'Login verification failed. Please try again.';
      loading.value = false;
      return;
    }
    
    // Redirect based on user role
    switch (user.role) {
      case 'admin':
        router.push('/admin');
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

function celebrateLogin() {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  confetti({ particleCount: 50, spread: 120, origin: { y: 0.6 } });
}

</script>