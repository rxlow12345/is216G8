<!-- frontend/src/pages/Signup.vue -->
<template>
  <div class="signup-wrapper">
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
          <h2 class="text-center mb-4">CritterConnects</h2>
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
                {{ showConfirmPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <div v-if="confirmPasswordBlurred && password !== confirmPassword && confirmPassword.length > 0" class="field-error">
              Passwords do not match
            </div>
          </div>
          
          <div class="form-group">
            <label for="role" class="form-label">Role</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <select class="form-control form-select" id="role" v-model="role" required>
                <option value="">Select your role</option>
                <option value="reporter">🎯 Reporter</option>
                <option value="volunteer">🤝 Volunteer</option>
              </select>
            </div>
            <div class="form-text">Choose your role in the wildlife reporting system.</div>
          </div>
          
          <div class="d-grid">
            <button 
              type="submit" 
              class="btn btn-primary"
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
  // Don't clear success message - let it persist
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
</script>

<style scoped>
.signup-wrapper {
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

/* Alert Messages - Made MORE VISIBLE */
.alert-danger {
  background: rgba(220, 38, 38, 0.9) !important;
  border: 2px solid #ef4444 !important;
  color: #ffffff !important;
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
  color: #ffffff !important;
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
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1);
}

/* Field-level Error Messages */
.field-error {
  color: #fca5a5;
  font-size: 13px;
  margin-top: 6px;
  font-weight: 500;
}

/* Select dropdown */
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23ffffff' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  cursor: pointer;
}

.form-select option {
  background: #065f46;
  color: #fff;
  padding: 10px;
}

/* Form Helper Text */
.form-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
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
  color: rgba(255, 255, 255, 0.95);
  font-size: 15px;
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