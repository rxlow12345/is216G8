<!-- frontend/src/pages/Login.vue -->
<template>
  <div class="login-wrapper">
    <!-- Floating Animals Background -->
    <div class="floating-animals">
      <div 
        v-for="(animal, index) in floatingAnimals" 
        :key="index"
        class="floating-animal"
        :style="getAnimalStyle(index)"
      >
        {{ animal }}
      </div>
    </div>

    <!-- Decorative Leaves -->
    <div class="leaf leaf-top">🍃</div>
    <div class="leaf leaf-bottom">🍃</div>

    <div class="container">
      <div class="auth-card">
        <!-- Header with Logo -->
        <div class="header">
          <div class="logo">
            <span class="logo-icon">🦊</span>
            <span class="logo-icon">🌿</span>
          </div>
          <h2 class="text-center mb-4">CritterConnect</h2>
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
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
          
          <div class="d-grid">
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner"></span>
              <span v-else>🌲 {{ loading ? 'Signing in...' : 'Sign In' }}</span>
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
import { login } from '../../src/api/auth.js';

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
.login-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* Floating Animals */
.floating-animals {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-animal {
  position: absolute;
  font-size: 40px;
  opacity: 0.2;
  animation: float 20s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(30px, -30px) rotate(10deg); }
  50% { transform: translate(-20px, 20px) rotate(-10deg); }
  75% { transform: translate(40px, 10px) rotate(5deg); }
}

/* Decorative Leaves */
.leaf {
  position: absolute;
  font-size: 80px;
  opacity: 0.15;
  color: #10b981;
  pointer-events: none;
  z-index: 0;
}

.leaf-top {
  top: 40px;
  left: 40px;
}

.leaf-bottom {
  bottom: 40px;
  right: 40px;
  transform: rotate(180deg);
}

/* Container */
.container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 440px;
}

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

/* Header */
.header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 50px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.logo-icon {
  animation: bounce 2s infinite;
}

.logo-icon:nth-child(2) {
  animation-delay: 0.2s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

h2 {
  color: #fff;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  margin: 0;
}

/* Alert Messages */
.alert-danger {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fecaca;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
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
  color: rgba(255, 255, 255, 0.9);
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
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  transition: all 0.3s;
  outline: none;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-control:focus {
  background: rgba(255, 255, 255, 0.12);
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  transform: translateY(-2px);
}

.form-control.is-invalid {
  border-color: #ef4444;
}

.invalid-feedback {
  color: #fecaca;
  font-size: 13px;
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

.btn-primary {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.7;
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

/* Sign Up Text */
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

.signup-text {
  color: rgba(255, 255, 255, 0.95);
  font-size: 15px;
  margin: 0;
  font-weight: 500;
}

.signup-link {
  color: #34d399;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s;
  font-size: 16px;
}

.signup-link:hover {
  color: #6ee7b7;
  text-decoration: underline;
  transform: scale(1.05);
}

/* Footer Critters */
.footer-critters {
  text-align: center;
  font-size: 36px;
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
}

.critter {
  display: inline-block;
  transition: transform 0.3s;
  cursor: pointer;
}

.critter:hover {
  transform: scale(1.5) rotate(30deg);
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