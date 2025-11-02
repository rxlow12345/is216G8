<template>
  <div class="new-report-page">
    <!-- Top Banner - Matching Reporter Dashboard style -->
    <div id="topBanner" class="bannerTitles">
      <header class="text-center mb-2">
        <h1>Report Wildlife</h1>
      </header>
    </div>

    <main class="report-container">
      <!-- Introduction Text -->
      <p class="intro-text">
        Thank you for reaching out to help local wildlife. Your report provides essential details that allow
        rescue teams to locate, assess, and respond to the situation quickly and safely.
      </p>

      <!-- Step Progress Indicator -->
      <div class="progress-indicator">
        <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
          <div class="step-number">
            <span v-if="currentStep > 1">✓</span>
            <span v-else>1</span>
          </div>
          <div class="step-label">Upload Documents</div>
        </div>
        <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
          <div class="step-number">
            <span v-if="currentStep > 2">✓</span>
            <span v-else>2</span>
          </div>
          <div class="step-label">Incident Details</div>
        </div>
        <div class="step" :class="{ active: currentStep === 3, completed: currentStep >= 3 }">
          <div class="step-number">
            <span v-if="currentStep >= 3">✓</span>
            <span v-else>3</span>
          </div>
          <div class="step-label">Animal Identification</div>
        </div>
      </div>

      <!-- Wizard form -->
      <form @submit.prevent="handleSubmit" class="report-form" novalidate ref="reportForm">
        <!-- STEP 1: Document -->
        <section :class="{ 'step-pane': true, 'active': currentStep === 1 }" data-step="1">
          <div class="content-card">
            <h2 class="section-title">Upload Documents</h2>
              
              <!-- Upload Section -->
              <div class="upload-section">
                <label class="form-label">Upload Photos/Videos (Recommended)</label>
                
                <!-- Drag and Drop Upload Area -->
                <div 
                  class="upload-area" 
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                  :class="{ 'drag-over': isDragging }"
                  @click="$refs.fileInput?.click()"
                >
                  <input 
                    ref="fileInput"
                    type="file" 
                    id="photos" 
                    name="photos" 
                    multiple 
                    accept="image/*,video/*"
                    class="d-none"
                    @change="handlePhotoChange"
                  >
                  <div class="upload-content">
                    <div class="upload-icon">📷</div>
                    <p class="upload-text primary">Drag and drop files here or click to browse</p>
                    <small class="upload-hint">Supported: Images and Videos</small>
                  </div>
                </div>

                <!-- File Preview Grid -->
                <div v-if="photoFiles.length > 0" class="file-preview-grid">
                  <div v-for="(file, index) in photoFiles" :key="index" class="file-preview-item">
                    <img v-if="file.type.startsWith('image/')" :src="getFilePreview(file)" alt="Preview" class="preview-image">
                    <div v-else class="preview-video">
                      <span>📹</span>
                      <small>{{ file.name }}</small>
                    </div>
                    <button type="button" class="remove-file" @click="removeFile(index)">×</button>
                  </div>
                </div>

                <small class="form-hint">Upload photos or videos that show the animal and incident location.</small>
                
                <!-- Species Detection Message -->
                <div class="species-message" v-html="speciesDetectionMessage"></div>
              </div>

              <!-- Location Section -->
              <div class="location-section">
                <label for="location" class="form-label">
                  Location <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <span class="input-icon">📍</span>
                  <input 
                    type="text" 
                    id="location" 
                    v-model="formData.location"
                    class="modern-input"
                    :class="{ 'is-invalid': errors.location }"
                    placeholder="e.g., Orchard Road, Singapore Botanic Gardens" 
                    required
                  >
                </div>
                <div class="invalid-feedback">{{ errors.location || 'Please provide a location.' }}</div>

                <button 
                  type="button" 
                  class="btn-live-location"
                  @click="handleLiveLocation"
                  :disabled="isGettingLocation"
                >
                  <span 
                    class="spinner-border spinner-border-sm me-2" 
                    :class="{ 'd-none': !isGettingLocation }"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span>📍 Live Location</span>
                </button>

                <div v-show="showMap" id="map-container" class="map-container">
                  <p class="map-hint">
                    <strong>Map Location:</strong> Click on the map or drag the marker to change location
                  </p>
                  <div id="osm-map" ref="mapContainer"></div>
                </div>
              </div>

              <!-- Date & Time Section -->
              <div class="datetime-section">
                <label for="sightingDateTime" class="form-label">
                  <span class="input-icon-label">📅</span>
                  Date &amp; Time of Sighting <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <span class="input-icon">📅</span>
                  <input 
                    type="datetime-local" 
                    id="sightingDateTime" 
                    v-model="formData.sightingDateTime"
                    class="modern-input"
                    :class="{ 'is-invalid': errors.sightingDateTime }"
                    required
                  >
                </div>
                <div class="invalid-feedback">{{ errors.sightingDateTime || 'Please select date & time.' }}</div>
              </div>
              
            <!-- Navigation Buttons - Inside Step 1 -->
            <div class="button-group">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="previousStep"
                :disabled="currentStep === 1"
                :style="{ opacity: currentStep === 1 ? 0.5 : 1, cursor: currentStep === 1 ? 'not-allowed' : 'pointer' }"
              >
                ← Back
              </button>
              <button 
                type="button" 
                class="btn btn-primary"
                @click="nextStep"
              >
                Next →
              </button>
            </div>
          </div>
        </section>

        <!-- STEP 2: Incident -->
        <section :class="{ 'step-pane': true, 'active': currentStep === 2 }" data-step="2">
          <div class="content-card">
            <h2 class="section-title">Incident Details</h2>

              <div class="form-row">
                <div class="form-group">
                  <label for="incidentType" class="form-label">
                    Type of Incident <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <select 
                      id="incidentType" 
                      v-model="formData.incidentType"
                      class="modern-select"
                      :class="{ 'is-invalid': errors.incidentType }"
                      required
                      @change="formData.incidentTypeOther = ''"
                    >
                      <option value="">Select incident type</option>
                      <option value="dead">Dead</option>
                      <option value="injured">Injured</option>
                      <option value="misplaced">Misplaced (Animal in Wrong Location)</option>
                      <option value="trapped">Trapped</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                  <div class="invalid-feedback">{{ errors.incidentType || 'Please select the incident type.' }}</div>
                  <input 
                    v-if="formData.incidentType === 'others'"
                    type="text" 
                    id="incidentTypeOther" 
                    v-model="formData.incidentTypeOther"
                    class="modern-input mt-2"
                    placeholder="Please specify..."
                  >
                </div>

                <div class="form-group">
                  <label for="severity" class="form-label">
                    Severity Level <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <select 
                      id="severity" 
                      v-model="formData.severity"
                      class="modern-select"
                      :class="{ 'is-invalid': errors.severity }"
                      required
                    >
                      <option value="">Select severity</option>
                      <option class='severityLow' value="low">Low - Not urgent</option>
                      <option class='severityModerate' value="moderate">Moderate - Needs attention</option>
                      <option class='severityHigh' value="urgent">Urgent - Immediate action needed</option>
                    </select>
                  </div>
                  <div class="invalid-feedback">{{ errors.severity || 'Please choose a severity.' }}</div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  Is the animal moving normally? <span class="required">*</span>
                </label>
                <div class="radio-group" role="radiogroup" aria-label="Moving normally">
                  <input 
                    type="radio" 
                    class="radio-input" 
                    id="movingYes"
                    v-model="formData.isMovingNormally"
                    value="yes" 
                    required 
                    autocomplete="off"
                  >
                  <label class="radio-label radio-yes" for="movingYes">Yes</label>

                  <input 
                    type="radio" 
                    class="radio-input" 
                    id="movingNo"
                    v-model="formData.isMovingNormally"
                    value="no" 
                    required 
                    autocomplete="off"
                  >
                  <label class="radio-label radio-no" for="movingNo">No</label>

                  <input 
                    type="radio" 
                    class="radio-input" 
                    id="movingUnknown"
                    v-model="formData.isMovingNormally"
                    value="unknown" 
                    required 
                    autocomplete="off"
                  >
                  <label class="radio-label radio-unknown" for="movingUnknown">Not sure</label>
                </div>
                <div v-if="errors.isMovingNormally" class="invalid-feedback mt-2 d-block">
                  {{ errors.isMovingNormally }}
                </div>
              </div>
              
            <!-- Navigation Buttons - Inside Step 2 -->
            <div class="button-group">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="previousStep"
              >
                ← Back
              </button>
              <button 
                type="button" 
                class="btn btn-primary"
                @click="nextStep"
              >
                Next →
              </button>
            </div>
          </div>
        </section>

        <!-- STEP 3: Animal -->
        <section :class="{ 'step-pane': true, 'active': currentStep === 3 }" data-step="3">
          <div class="content-card">
            <h2 class="section-title">Animal Identification</h2>
              
              <div class="form-group">
                <label for="speciesName" class="form-label">Species Name (if known)</label>
                <div class="input-wrapper">
                  <input 
                    type="text" 
                    id="speciesName" 
                    v-model="formData.speciesName"
                    class="modern-input"
                    placeholder="e.g., Common Palm Civet, Hornbill, Wild Boar, etc."
                  >
                </div>
              </div>

              <div class="form-group">
                <label for="description" class="form-label">
                  Describe Special Behaviour or Condition<span class="required">*</span>
                </label>
                <textarea 
                  id="description" 
                  v-model="formData.description"
                  class="modern-textarea"
                  :class="{ 'is-invalid': errors.description }"
                  rows="4" 
                  required
                  placeholder="e.g., Limping, Bleeding, Nesting, Aggressive Behaviour, etc."
                ></textarea>
                <div class="invalid-feedback">{{ errors.description || 'Please describe the condition of the animal.' }}</div>
              </div>
              
            <!-- Navigation Buttons - Inside Step 3 -->
            <div class="button-group">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="previousStep"
              >
                ← Back
              </button>
              <button 
                type="submit" 
                class="btn btn-submit"
                @click="handleSubmit"
                :disabled="isSubmitting"
                :style="{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ isSubmitting ? 'Submitting...' : 'Submit Report' }}
              </button>
            </div>
          </div>
        </section>
      </form>

      <!-- Status Message -->
      <div v-if="statusMessage" class="mt-3" v-html="statusMessage"></div>

      <!-- Success Modal -->
      <div 
        class="modal fade" 
        id="submitSuccessModal" 
        tabindex="-1"
        aria-labelledby="submitSuccessLabel" 
        aria-hidden="true"
        ref="successModal"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="submitSuccessLabel">Report Submitted</h5>
              <button type="button" class="btn-close" aria-label="Close" @click="closeModal"></button>
            </div>

            <div class="modal-body">
              <div v-html="modalStatus"></div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="goHome">Home</button>
              <router-link to="/report" class="btn btn-primary">Go to Status Page</router-link>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { Modal } from 'bootstrap';
import { getCurrentUser } from '../../src/api/auth.js';
// Import CSS in order so our styles override common.css
import './report.css'; // Import local styles first
import '../css/report.css';
import '../css/common.css'; // Then common.css (we'll override it)

const router = useRouter();

  // IMMEDIATELY on component creation, before mount, hide footers only (keep banner)
onBeforeMount(() => {
  // Inject style immediately to prevent footer rendering
  if (!document.getElementById('new-report-immediate-style')) {
    const style = document.createElement('style');
    style.id = 'new-report-immediate-style';
    style.textContent = `
      /* Hide footers and emergency strip, but keep top banner */
      footer, .emergency-strip, .footer-body, #footer,
      body footer, body .emergency-strip, body .footer-body,
      [class*="footer"]:not(.form-footer):not(.modal-footer),
      [class*="emergency"] {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
      }
      
      body, html {
        background-color: #FEFAE0 !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Remove footers only (keep banner)
  ['footer', '#footer', '.emergency-strip', '.footer-body'].forEach(sel => {
    try {
      const els = document.querySelectorAll(sel);
      els.forEach(el => {
        if (el) {
          el.style.display = 'none';
          el.remove();
        }
      });
    } catch (e) {}
  });
});

// API Configuration
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment
  ? `${window.location.protocol}//${window.location.hostname}:4100/api`
  : '/api';

const OPENCAGE_API_KEY = "9047284f3fca4d20a801c1c973198406";
const OPENCAGE_BASE_URL = "https://api.opencagedata.com/geocode/v1/json";

// Form Data
const formData = reactive({
  location: '',
  sightingDateTime: '',
  incidentType: '',
  incidentTypeOther: '',
  severity: '',
  isMovingNormally: '',
  speciesName: '',
  description: ''
});

// Form State
const currentStep = ref(1);
const totalSteps = 3;
const errors = reactive({});
const photoFiles = ref([]);
const isGettingLocation = ref(false);
const showMap = ref(false);
const isSubmitting = ref(false);
const statusMessage = ref('');
const speciesDetectionMessage = ref('');
const modalStatus = ref('');
const map = ref(null);
const mapContainer = ref(null);
const reportForm = ref(null);
const successModal = ref(null);
const marker = ref(null);
const isDragging = ref(false);

// Computed
const progressPercentage = computed(() => {
  const pct = Math.round(((currentStep.value - 1) / totalSteps) * 100);
  return pct < 0 ? 0 : pct;
});

// Load Leaflet dynamically
function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) {
      resolve(window.L);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    script.onerror = () => {
      console.error('Failed to load Leaflet');
      resolve(null);
    };
    document.head.appendChild(script);
  });
}

// Set default datetime and get current location on mount
onMounted(async () => {
  // IMMEDIATELY hide footers only (keep top banner)
  const immediateStyle = document.createElement('style');
  immediateStyle.id = 'immediate-removal-style';
  immediateStyle.textContent = `
    /* Immediate removal of footers only - keep top banner */
    footer, .emergency-strip, .footer-body, #footer,
    [class*="footer"]:not(.form-footer):not(.modal-footer),
    [class*="emergency"] {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Match other pages background */
    body, html {
      background-color: #FEFAE0 !important;
    }
  `;
  document.head.insertBefore(immediateStyle, document.head.firstChild);
  
  const now = new Date();
  const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  formData.sightingDateTime = localDateTime;

  // Aggressively remove footer and emergency strip if they exist
  const removeFooter = () => {
    // Multiple selectors to catch all possible footer elements
    const selectors = [
      'footer',
      '.emergency-strip',
      '.footer-body',
      '[class*="footer"]',
      '[class*="emergency"]',
      '#footer',
      '[id*="footer"]',
      '[id="footer"]',
      'div#footer'
    ];
    
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          // CRITICAL: Do NOT remove form-footer or modal-footer - these are needed!
          if (el && el.parentNode && 
              !el.classList.contains('form-footer') && 
              !el.classList.contains('modal-footer') &&
              el.id !== 'form-footer-nav' &&
              !el.getAttribute('data-form-footer')) {
            // Remove the element completely
            el.remove();
            // Also try to remove all its children
            try {
              while (el.firstChild) {
                el.removeChild(el.firstChild);
              }
            } catch (e) {}
            // Set innerHTML to empty as well
            try {
              el.innerHTML = '';
            } catch (e) {}
          }
        });
      } catch (e) {
        // Ignore selector errors
      }
    });
    
    // Specifically target the #footer div that the static HTML creates (but not form-footer)
    const footerDiv = document.getElementById('footer');
    if (footerDiv && !footerDiv.classList.contains('form-footer')) {
      footerDiv.remove();
      footerDiv.innerHTML = '';
    }
  };
  
  // Intercept fetch calls for footer.html to prevent it from loading
  const originalFetch = window.fetch;
  try {
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && (url.includes('footer.html') || url.includes('Footer'))) {
        // Block the fetch and return empty response
        console.log('Blocked footer.html fetch');
        return Promise.resolve(new Response('', { status: 200, statusText: 'OK' }));
      }
      return originalFetch.apply(this, args);
    };
  } catch (e) {
    console.log('Could not intercept fetch:', e);
  }
  
  // Also prevent any script that tries to load footer
  const preventFooterScript = `
    (function() {
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string' && url.includes('footer.html')) {
          return Promise.resolve(new Response('', { status: 200 }));
        }
        return originalFetch.apply(this, args);
      };
    })();
  `;
  const scriptTag = document.createElement('script');
  scriptTag.textContent = preventFooterScript;
  document.head.appendChild(scriptTag);
  
  // Remove immediately and also watch for dynamically added footers
  removeFooter();
  setTimeout(removeFooter, 10);
  setTimeout(removeFooter, 50);
  setTimeout(removeFooter, 100);
  setTimeout(removeFooter, 200);
  setTimeout(removeFooter, 300);
  setTimeout(removeFooter, 500);
  setTimeout(removeFooter, 1000);
  setTimeout(removeFooter, 2000);
  
  // Run removal continuously every 500ms for the first 10 seconds
  let removalCount = 0;
  const continuousRemoval = setInterval(() => {
    removeFooter();
    removalCount++;
    if (removalCount > 20) { // Stop after 10 seconds (20 * 500ms)
      clearInterval(continuousRemoval);
    }
  }, 500);
  
  // Set up MutationObserver to watch for dynamically added footers
  const footerObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Check if it's a footer-related element (but NOT form-footer or modal-footer)
          const isFooter = (node.tagName === 'FOOTER' ||
            node.classList?.contains('emergency-strip') ||
            node.classList?.contains('footer-body') ||
            node.id === 'footer' ||
            (node.id?.includes('footer') && node.id !== 'form-footer-nav') ||
            (node.className?.includes('footer') && !node.classList?.contains('form-footer') && !node.classList?.contains('modal-footer') && !node.getAttribute('data-form-footer')) ||
            node.className?.includes('emergency')) &&
            !node.classList?.contains('form-footer') &&
            !node.classList?.contains('modal-footer') &&
            node.id !== 'form-footer-nav' &&
            !node.getAttribute('data-form-footer');
          
          if (isFooter) {
            node.remove();
            return;
          }
          
          // Also check and remove footer children immediately (but NOT form-footer or modal-footer)
          if (node.querySelectorAll) {
            const footerChildren = node.querySelectorAll('footer, .emergency-strip, .footer-body, [id*="footer"], [id="footer"]');
            footerChildren.forEach(el => {
              // Skip form-footer and modal-footer - these should NOT be removed
              if (!el.classList.contains('form-footer') && 
                  !el.classList.contains('modal-footer') &&
                  el.id !== 'form-footer-nav' &&
                  !el.getAttribute('data-form-footer')) {
                el.remove();
                el.innerHTML = '';
              }
            });
            
            // Also check for class*="footer" but exclude form-footer and modal-footer
            const allFooterLike = node.querySelectorAll('[class*="footer"]');
            allFooterLike.forEach(el => {
              if (!el.classList.contains('form-footer') && 
                  !el.classList.contains('modal-footer') &&
                  el.id !== 'form-footer-nav' &&
                  !el.getAttribute('data-form-footer')) {
                el.remove();
                el.innerHTML = '';
              }
            });
          }
        }
      });
    });
    
    // Also run removal after each mutation
    removeFooter();
  });
  
  footerObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
  
  // Also observe the document for any footer additions
  footerObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  // Also hide any banner strips above navbar (especially red/orange ones)
  const removeBannerStrips = () => {
    // Check body children
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach(child => {
      if (child.id !== 'app' && 
          child.tagName !== 'SCRIPT' &&
          child.tagName !== 'HEADER' &&
          child.tagName !== 'MAIN' &&
          child.tagName !== 'STYLE') {
        const computedStyle = window.getComputedStyle(child);
        const bgColor = computedStyle.backgroundColor;
        const height = parseInt(computedStyle.height);
        
        // Remove thin colored bars (height < 10px) or red/orange backgrounds
        if ((height > 0 && height < 10) || 
            bgColor.includes('255, 0, 0') || // red
            bgColor.includes('255, 69, 0') || // red-orange
            bgColor.includes('255, 99, 71') || // tomato
            bgColor.includes('220, 20, 60') || // crimson
            bgColor.includes('rgb(255') && !bgColor.includes('255, 255')) { // any rgb(255... that's not white
          child.remove();
        } else if (bgColor && 
            bgColor !== 'rgba(0, 0, 0, 0)' && 
            bgColor !== 'transparent' &&
            !bgColor.includes('255, 255, 255') &&
            !bgColor.includes('250, 248, 243')) {
          child.remove();
        }
      }
    });
    
    // Also check for any elements before #app
    const appElement = document.getElementById('app');
    if (appElement && appElement.previousElementSibling) {
      const prev = appElement.previousElementSibling;
      if (prev.tagName !== 'SCRIPT' && prev.tagName !== 'STYLE') {
        prev.remove();
      }
    }
    
    // Remove pseudo-elements by injecting style
    if (!document.getElementById('remove-red-strip-style')) {
      const style = document.createElement('style');
      style.id = 'remove-red-strip-style';
      style.textContent = `
        body::before, body::after,
        html::before, html::after,
        header::before, header::after,
        .customNavbar::before, .customNavbar::after {
          display: none !important;
          content: none !important;
          height: 0 !important;
          width: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }
  };
  
  removeBannerStrips();
  setTimeout(removeBannerStrips, 50);
  setTimeout(removeBannerStrips, 100);
  setTimeout(removeBannerStrips, 200);

  // Preload Leaflet (don't await - let it load in background)
  loadLeaflet();

  // Automatically get current location on mount (non-blocking)
  // This runs independently and won't block image upload/processing
  handleLiveLocation().catch(error => {
    console.log('Could not get current location automatically:', error);
    // Don't show alert on automatic failure, just log it
  });
});

// Helper Functions
function compressImage(file, maxWidth = 600, quality = 0.5) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

      const sizeKB = Math.round(compressedDataUrl.length / 1024);
      if (sizeKB > 500) {
        const moreCompressed = canvas.toDataURL('image/jpeg', 0.3);
        resolve(moreCompressed);
      } else {
        resolve(compressedDataUrl);
      }
    };

    img.src = URL.createObjectURL(file);
  });
}

async function uploadFile(file) {
  if (file.type.startsWith('image/')) {
    statusMessage.value = `
      <div style="color: #2196F3; font-weight: bold; background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 10px 0;">
        Compressing and uploading image to cloud storage...
      </div>
    `;

    const compressedImage = await compressImage(file);

    try {
      const response = await fetch(`${API_BASE_URL}/reports/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: compressedImage })
      });

      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 200)}`);
      }

      if (response.ok && result.success) {
        statusMessage.value = '';
        return result.data.imageURL;
      } else {
        throw new Error(result.message || result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      let errorMsg = error.message || 'Unknown error';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMsg = 'Cannot connect to server. Please ensure the backend server is running on port 4100.';
      } else if (error.message.includes('Firebase')) {
        errorMsg = 'Firebase Storage error. Please check Firebase configuration in the backend.';
      }
      
      statusMessage.value = `
        <div style="color: #f44336; font-weight: bold; background: #ffebee; padding: 15px; border-radius: 4px; margin: 10px 0;">
          Failed to upload image: ${errorMsg}
        </div>
      `;
      throw error;
    }
  } else {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      return reject(new Error("Geolocation not supported."));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function reverseGeocode(lat, lon) {
  // Force English language regardless of system language
  const url = `${OPENCAGE_BASE_URL}?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}&language=en`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenCage API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted;
    } else if (data.status.code === 402) {
      throw new Error("OpenCage quota exceeded or key invalid.");
    } else {
      return `No street address found for this location. (Lat: ${lat.toFixed(5)})`;
    }
  } catch (error) {
    console.error("Reverse Geocoding Error:", error);
    throw new Error("Failed to connect to the geocoding service.");
  }
}

async function embedMap(lat, lon) {
  // Only show map on step 1 where the location field is
  if (currentStep.value !== 1) {
    return;
  }
  
  if (!mapContainer.value) {
    // Don't log error if we're not on step 1 - the container just isn't visible yet
    if (currentStep.value === 1) {
      console.error("Map container not found!");
    }
    return;
  }

  // Ensure Leaflet is loaded
  const L = await loadLeaflet();
  if (!L) {
    alert('Failed to load map. Please try again.');
    return;
  }

  nextTick(() => {
    // Initialize map if it doesn't exist
    if (!map.value) {
      map.value = L.map(mapContainer.value).setView([lat, lon], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.value);

      // Add click handler to map
      map.value.on('click', async (e) => {
        const clickedLat = e.latlng.lat;
        const clickedLon = e.latlng.lng;
        
        // Update marker position
        if (marker.value) {
          marker.value.setLatLng([clickedLat, clickedLon]);
        } else {
          marker.value = L.marker([clickedLat, clickedLon], { draggable: true })
            .addTo(map.value)
            .bindPopup("Selected Location")
            .openPopup();
        }

        // Update location field with reverse geocoded address
        try {
          isGettingLocation.value = true;
          const address = await reverseGeocode(clickedLat, clickedLon);
          formData.location = address;
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          formData.location = `${clickedLat.toFixed(6)}, ${clickedLon.toFixed(6)}`;
        } finally {
          isGettingLocation.value = false;
        }

        // Update popup with new location
        marker.value.bindPopup(`Selected Location<br>${formData.location}`).openPopup();
      });
    } else {
      // Update existing map view
      map.value.setView([lat, lon], 15);
    }

    // Add or update marker
    if (marker.value) {
      marker.value.setLatLng([lat, lon]);
      marker.value.bindPopup(`Current Location<br>${formData.location || 'Loading...'}`).openPopup();
    } else {
      marker.value = L.marker([lat, lon], { draggable: true })
        .addTo(map.value)
        .bindPopup(`Current Location<br>${formData.location || 'Loading...'}`)
        .openPopup();
      
      // Add dragend event to marker
      marker.value.on('dragend', async (e) => {
        const markerLat = marker.value.getLatLng().lat;
        const markerLon = marker.value.getLatLng().lng;
        
        // Update location field with reverse geocoded address
        try {
          isGettingLocation.value = true;
          const address = await reverseGeocode(markerLat, markerLon);
          formData.location = address;
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          formData.location = `${markerLat.toFixed(6)}, ${markerLon.toFixed(6)}`;
        } finally {
          isGettingLocation.value = false;
        }

        // Update popup
        marker.value.bindPopup(`Selected Location<br>${formData.location}`).openPopup();
      });
    }

    showMap.value = true;
    nextTick(() => {
      if (map.value) {
        map.value.invalidateSize();
      }
    });
  });
}

async function handleLiveLocation() {
  isGettingLocation.value = true;
  formData.location = '';
  
  try {
    const position = await getCurrentLocation();
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Show map first, then update with address
    await embedMap(lat, lon);
    
    // Get address and update location field
    try {
      const address = await reverseGeocode(lat, lon);
      formData.location = address;
      // Update marker popup with address
      if (marker.value) {
        marker.value.bindPopup(`Current Location<br>${address}`).openPopup();
      }
    } catch (geocodeError) {
      // If geocoding fails, use coordinates
      formData.location = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      if (marker.value) {
        marker.value.bindPopup(`Current Location<br>${formData.location}`).openPopup();
      }
    }
  } catch (error) {
    let errorMessage = 'Unable to get location.';
    if (error.message.includes('permission denied')) {
      errorMessage = 'Geolocation permission denied. Please allow location access or enter location manually.';
    } else if (error.message.includes('OpenCage')) {
      errorMessage = error.message;
    }
    // Only show alert if called manually (not on mount)
    if (errorMessage !== '') {
      console.error('Location error:', errorMessage);
    }
  } finally {
    isGettingLocation.value = false;
  }
}

async function identifySpecies(imageFile) {
  try {
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    const response = await fetch(`${API_BASE_URL}/reports/identify-species`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageData: base64Data }),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(60000) // 60 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Backend API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {
        // Not JSON, use text
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    if (result.success) {
      return result.data.predictions;
    } else {
      throw new Error(result.message || 'Species identification failed');
    }
  } catch (error) {
    console.error('Species identification failed:', error);
    
    // Handle different error types
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      speciesDetectionMessage.value = `
        <div style="color: #000000ff; font-weight: bold; padding: 10px; border-radius: 4px; font-size: 14px;">
          ⏱️ Species identification is taking longer than expected. Please try again or enter species name manually.
        </div>
      `;
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      speciesDetectionMessage.value = `
        <div style="color: #000000ff; font-weight: bold; padding: 10px; border-radius: 4px; font-size: 14px;">
          ⚠️ Cannot connect to species identification service. Please check your connection or enter species name manually.
        </div>
      `;
    } else {
      speciesDetectionMessage.value = `
        <div style="color: #000000ff; font-weight: bold; padding: 10px; border-radius: 4px; font-size: 14px;">
          ⚠️ Species identification service temporarily unavailable: ${error.message}. Please enter species name manually.
        </div>
      `;
    }
    return null;
  }
}

function displaySpeciesResults(predictions) {
  if (predictions && Object.keys(predictions).length > 0) {
    const firstKey = Object.keys(predictions)[0];
    const prediction = predictions[firstKey];

    if (prediction && prediction.length > 0) {
      const topPrediction = prediction[0];

      if (topPrediction.unidentified) {
        speciesDetectionMessage.value = `
          <div style="color: #000000ff; font-weight: bold; padding: 10px; border-radius: 4px; font-size: 14px;">
            🔍 Species Identification Result:
            <br><em>${topPrediction.message || 'Please enter the species name manually below.'}</em>
            <br><small style="color: #2e2e2eff; font-weight: normal; margin-top: 5px; display: block;">
              💡 Tip: You can enter common names like "Hornbill", "Wild Boar", "Palm Civet", etc.
            </small>
          </div>
        `;
        return;
      }

      const speciesName = topPrediction.class_name || topPrediction.species || 'Unknown';
      const confidence = Math.round((topPrediction.confidence || topPrediction.score || 0) * 100);

      if (confidence >= 60 && !formData.speciesName) {
        formData.speciesName = speciesName;
      }

      let message = `
        <div style="color: #000000ff; font-weight: bold; padding: 10px; border-radius: 4px; font-size: 14px;">
          🐾 Species Identification Result:
          <br><span class="species-name">${speciesName}</span> (Confidence: ${confidence}%)
          ${confidence >= 60 ? '<br><em>Species name automatically filled</em>' : '<br><em>Low confidence, please verify manually</em>'}
        </div>
      `;

      if (prediction.length > 1) {
        const additionalResults = prediction.slice(1, 4).map(p =>
          `• ${p.class_name || p.species || 'Unknown'} (${Math.round((p.confidence || p.score || 0) * 100)}%)`
        ).join('<br>');
        message += `
          <div style="color: #000000ff; font-size: 12px; margin-top: 8px;">
            Other possible species:<br>${additionalResults}
          </div>
        `;
      }

      speciesDetectionMessage.value = message;
    } else {
      speciesDetectionMessage.value = `
        <div style="color: #000000ff; font-weight: bold; padding: 10px; border-radius: 4px; font-size: 14px;">
          ⚠️ Unable to identify species, please enter species name manually
        </div>
      `;
    }
  } else {
    speciesDetectionMessage.value = `
      <div style="color: #000000ff; font-weight: bold; padding: 10px; border-radius: 4px; font-size: 14px;">
        ⚠️ Species identification service temporarily unavailable, please enter species name manually
      </div>
    `;
  }
}

function handleDrop(event) {
  isDragging.value = false;
  const files = Array.from(event.dataTransfer.files).filter(file => 
    file.type.startsWith('image/') || file.type.startsWith('video/')
  );
  if (files.length === 0) return;
  
  processFiles(files);
  // Update the file input if it exists
  if (event.target.closest('.upload-area')?.querySelector('input[type="file"]')) {
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    event.target.closest('.upload-area').querySelector('input[type="file"]').files = dataTransfer.files;
  }
}

function getFilePreview(file) {
  return URL.createObjectURL(file);
}

function removeFile(index) {
  photoFiles.value.splice(index, 1);
  // Clear species detection message if removing all files
  if (photoFiles.value.length === 0) {
    speciesDetectionMessage.value = '';
    formData.speciesName = '';
  }
}

function processFiles(files) {
  photoFiles.value = files;
  const firstImageFile = files.find(file => file.type.startsWith('image/'));
  if (!firstImageFile) return;
  
  // Trigger species identification
  handleSpeciesIdentification(firstImageFile);
}

async function handleSpeciesIdentification(imageFile) {
  let startTime = Date.now();
  let timerInterval;

  speciesDetectionMessage.value = `
    <div style="color:#050000ff;font-weight:bold;padding:10px;border-radius:4px;font-size:16px;">
      🔍 Identifying species... This may take up to 30 seconds
      <br><small style="color:#000000ff;font-weight:normal;">Please wait while AI analyzes the image</small>
      <div id="progressTimer" style="margin-top:5px;font-size:12px;color:#000000ff;"></div>
    </div>
  `;

  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const timer = document.getElementById('progressTimer');
    if (timer) {
      timer.textContent = `Processing time: ${elapsed} seconds`;
    }
  }, 1000);

  try {
    const predictions = await identifySpecies(imageFile);
    clearInterval(timerInterval);
    if (predictions !== null) {
      displaySpeciesResults(predictions);
    }
  } catch (error) {
    clearInterval(timerInterval);
    console.error('Species identification error:', error);
  }
}

async function handlePhotoChange(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  processFiles(files);
}

function validateCurrentStep() {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key]);

  let isValid = true;

  if (currentStep.value === 1) {
    if (!formData.location) {
      errors.location = 'Please provide a location.';
      isValid = false;
    }
    if (!formData.sightingDateTime) {
      errors.sightingDateTime = 'Please select date & time.';
      isValid = false;
    }
  } else if (currentStep.value === 2) {
    if (!formData.incidentType) {
      errors.incidentType = 'Please select the incident type.';
      isValid = false;
    }
    if (!formData.severity) {
      errors.severity = 'Please choose a severity.';
      isValid = false;
    }
    if (!formData.isMovingNormally) {
      errors.isMovingNormally = 'Please choose an option.';
      isValid = false;
    }
  } else if (currentStep.value === 3) {
    if (!formData.description) {
      errors.description = 'Please describe the condition of the animal.';
      isValid = false;
    }
  }

  return isValid;
}

function nextStep() {
  if (validateCurrentStep()) {
    if (currentStep.value < totalSteps) {
      currentStep.value++;
    }
  } else {
    // Scroll to first error
    const firstError = document.querySelector('.is-invalid');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

async function handleSubmit(event) {
  if (!validateCurrentStep()) {
    const firstError = document.querySelector('.is-invalid');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
    return;
  }

  isSubmitting.value = true;
  statusMessage.value = 'Submitting report...';

  try {
    const uploadedPhotoURLs = [];

    if (photoFiles.value.length > 0) {
      statusMessage.value = `
        <div style="color: #2196F3; font-weight: bold; background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 10px 0;">
          Uploading ${photoFiles.value.length} file(s) to cloud storage...
        </div>
      `;

      for (let i = 0; i < photoFiles.value.length; i++) {
        const file = photoFiles.value[i];
        statusMessage.value = `
          <div style="color: #2196F3; font-weight: bold; background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 10px 0;">
            Uploading ${file.type.startsWith('image/') ? 'image' : 'file'} ${i + 1} of ${photoFiles.value.length}...
          </div>
        `;
        const url = await uploadFile(file);
        uploadedPhotoURLs.push(url);
      }
    }

    // Get current user to set reporterID
    let reporterId = null;
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        // Use uid if available, otherwise fallback to email
        reporterId = currentUser.uid || currentUser.email || null;
      }
    } catch (error) {
      console.warn('Could not get current user for reporterID:', error);
      // Continue without reporterID if user fetch fails
    }

    const reportData = {
      incidentType: formData.incidentType,
      incidentTypeOther: formData.incidentTypeOther,
      severity: formData.severity,
      description: formData.description,
      location: formData.location,
      sightingDateTime: formData.sightingDateTime,
      speciesName: formData.speciesName,
      isMovingNormally: formData.isMovingNormally,
      photoURLs: uploadedPhotoURLs,
      reporterId: reporterId // Add reporterID (uid or email)
    };

    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });

    // Check if response is ok before trying to parse JSON
    let result;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Server returned ${response.status}: ${text.substring(0, 200)}`);
    }

    // If response is not ok, use the error message from result
    if (!response.ok) {
      throw new Error(result.message || `Server error: ${response.status}`);
    }

    if (response.ok && result.success) {
      modalStatus.value = `
        <div class="fw-bold text-success">
          ✅ Report submitted successfully!<br>
          Report ID: ${result.data.reportId}<br>
          Status: ${result.data.status}<br>
          Priority: ${result.data.priority}<br>
          <small>You will be contacted if further information is needed.</small>
        </div>
      `;

      // Show modal
      if (successModal.value) {
        const modal = new Modal(successModal.value);
        modal.show();
      }

      // Reset form
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'string') {
          formData[key] = '';
        }
      });
      photoFiles.value = [];
      currentStep.value = 1;
      
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      formData.sightingDateTime = localDateTime;
    } else {
      throw new Error(result.message || 'Failed to submit report');
    }
  } catch (error) {
    console.error('Submit error:', error);
    let errorMsg = error.message || 'Unknown error occurred';
    
    // Handle network errors more gracefully
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMsg = 'Unable to connect to server. Please check your internet connection and ensure the backend server is running.';
    }
    
    statusMessage.value = `
      <div style="color: red; font-weight: bold; padding: 15px; border-radius: 4px; background: #ffebee; margin: 10px 0;">
        ❌ Error submitting report: ${errorMsg}<br>
        <small>Please check your connection and try again, or contact support.</small>
      </div>
    `;
  } finally {
    isSubmitting.value = false;
  }
}

function closeModal() {
  if (successModal.value) {
    const modal = Modal.getInstance(successModal.value);
    if (modal) {
      modal.hide();
    }
  }
}

function goHome() {
  router.push('/');
}
</script>

<style scoped>
/* ============================================
   MODERN REPORT WILDLIFE PAGE DESIGN SYSTEM
   ============================================ */

/* Color Palette */
:root {
  --bg-cream: #FAF8F3;
  --bg-white: #FFFFFF;
  --primary-green: #5a7c5a;
  --button-brown: #B8784A;
  --text-dark: #333333;
  --text-gray: #666666;
  --border-light: #e0e0e0;
  --border-dashed: #d4d4d4;
  --bg-inactive: #f5f5f5;
  --bg-hover: #f0f0f0;
  --error-red: #dc3545;
  --success-green: #28a745;
}

/* Overall Page Layout - Match other pages style (clean, no banners) */
.new-report-page {
  min-height: 100vh;
  background: rgb(254, 250, 224) !important; /* #FEFAE0 - matches navbar and other pages */
  font-family: Georgia, 'Times New Roman', Times, serif;
  padding-bottom: 50px;
  margin: 0;
}

/* Keep the top banner - matching Reporter Dashboard style */
.new-report-page #topBanner {
  display: block !important;
}

.new-report-page .bannerTitles {
  display: block !important;
}

/* Hide Footer and Emergency Strip on this page */
/* Ensure body and html have no colored strips */
body:has(.new-report-page),
html:has(.new-report-page) {
  background-color: #FEFAE0 !important;
}

body:has(.new-report-page)::before,
body:has(.new-report-page)::after,
html:has(.new-report-page)::before,
html:has(.new-report-page)::after,
header::before,
header::after,
.customNavbar::before,
.customNavbar::after {
  display: none !important;
  content: none !important;
}

/* Remove any elements above the navbar */
body:has(.new-report-page) > *:not(#app):not(script):not(style) {
  position: relative;
}

/* Ensure header starts at the very top with no spacing */
body:has(.new-report-page) header {
  margin-top: 0 !important;
  padding-top: 0 !important;
  top: 0 !important;
}

/* Remove any red or colored bars */
body:has(.new-report-page) > div:not(#app),
#app:has(.new-report-page) > *:first-child:not(header) {
  background-color: transparent !important;
}


/* ============================================
   1. OVERALL CONTAINER & LAYOUT
   ============================================ */
.report-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}

.intro-text {
  background: #ffffff;
  padding: 1.25rem;
  border-radius: 16px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 2rem;
  border-left: 4px solid #6b9e3e;
  font-size: 1rem;
  border: 1px solid #e8e4d8;
}


/* ============================================
   2. PROGRESS INDICATOR REDESIGN
   ============================================ */
.progress-indicator {
  display: flex;
  justify-content: center;
  margin: 3rem 0;
  position: relative;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  z-index: 2;
  transition: all 0.3s ease;
  border: 2px solid #d4cdb8;
}

.step.active .step-number {
  background: linear-gradient(135deg, #6b9e3e 0%, #8fbc5a 100%);
  border-color: #6b9e3e;
  color: white;
  box-shadow: 0 4px 12px rgba(107, 158, 62, 0.3);
}

.step.completed .step-number {
  background: #6b9e3e;
  border-color: #6b9e3e;
  color: white;
  box-shadow: 0 4px 12px rgba(107, 158, 62, 0.3);
}

/* Connecting lines between steps */
.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: #e0e0e0;
  z-index: 1;
}

.step.completed:not(:last-child)::after {
  background: linear-gradient(90deg, #6b9e3e 0%, #8fbc5a 100%);
}

.step-label {
  font-size: 0.875rem;
  color: #666;
  text-align: center;
  margin-top: 0.5rem;
  text-decoration: none !important;
  font-weight: 500;
}

.step.active .step-label,
.step.completed .step-label {
  color: #2d5016;
  font-weight: 600;
  text-decoration: none !important;
}

/* ============================================
   3. CONTENT CARD STYLING
   ============================================ */
.content-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  padding: 2.5rem;
  margin-top: 2rem;
  border: 2px solid #e8e4d8;
  transition: all 0.3s ease;
}

/* ============================================
   10. SECTION HEADERS
   ============================================ */
h2.section-title {
  color: #2d5016;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  text-decoration: none !important;
  border-bottom: none !important;
  padding-bottom: 0;
}

h3 {
  color: #2d5016;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  font-weight: 600;
  text-decoration: none !important;
  border-bottom: none !important;
}

h1 {
  text-decoration: none !important;
  border-bottom: none !important;
}

.form-title {
  text-decoration: none !important;
  border-bottom: none !important;
  padding-bottom: 0;
  margin-bottom: 1.5rem;
}

/* ============================================
   6. FORM INPUTS STYLING
   ============================================ */
label.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2d5016;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none !important;
  border-bottom: none !important;
}

.required {
  color: #c85a54;
}

input[type="text"],
input[type="datetime-local"],
select,
textarea {
  width: 100%;
  padding: 0.9rem 1.1rem;
  border: 2px solid #d4cdb8;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #fafaf8;
  color: #333;
  line-height: 1.6;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #6b9e3e;
  background: white;
  box-shadow: 0 0 0 3px rgba(107, 158, 62, 0.1);
}

/* Input Wrapper with Icons */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 15px;
  font-size: 1.1rem;
  z-index: 1;
  pointer-events: none;
}

.input-icon-label {
  margin-right: 0.5rem;
}

/* Modern Input Styles */
.modern-input,
.modern-select,
.modern-textarea {
  width: 100%;
  height: auto;
  min-height: 45px;
  padding: 0.9rem 1.1rem 0.9rem 3rem;
  border: 2px solid #d4cdb8;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #333;
  background: #fafaf8;
  transition: all 0.3s ease;
  box-sizing: border-box;
  line-height: 1.6;
}

.modern-select {
  padding-right: 2.5rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-color: #fafaf8;
}

.modern-textarea {
  height: auto;
  padding: 0.9rem 1.1rem;
  min-height: 120px;
  resize: vertical;
}

.modern-input:focus,
.modern-select:focus,
.modern-textarea:focus {
  outline: none;
  border-color: #6b9e3e;
  background: white;
  box-shadow: 0 0 0 3px rgba(107, 158, 62, 0.1);
}

.modern-input.is-invalid,
.modern-select.is-invalid,
.modern-textarea.is-invalid {
  border-color: #c85a54;
}

.invalid-feedback {
  display: block;
  color: var(--error-red);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-hint {
  display: block;
  color: var(--text-gray);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* ============================================
   4. UPLOAD SECTION (Step 1)
   ============================================ */
.upload-section {
  margin-bottom: 2rem;
}

.upload-area {
  border: 3px dashed #c4b89f;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  background: #fdfcfa;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #8fbc5a;
  background: #f5f7f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.upload-content {
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: #8fbc5a;
  margin-bottom: 1rem;
}

.upload-text {
  color: #555;
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.upload-text.primary {
  font-size: 1.1rem;
  color: #2d5016;
  font-weight: 600;
}

.upload-hint {
  font-size: 0.875rem;
  color: #777;
  font-style: italic;
}

/* File Preview Grid */
.file-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.file-preview-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #d4cdb8;
  transition: all 0.3s ease;
}

.file-preview-item:hover {
  border-color: #6b9e3e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.preview-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.preview-video {
  width: 100%;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fdfcfa;
  font-size: 2rem;
  border-radius: 12px;
}

.preview-video small {
  font-size: 0.75rem;
  color: var(--text-gray);
  margin-top: 0.5rem;
  padding: 0 0.5rem;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.remove-file {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-file:hover {
  background: #c85a54;
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(200, 90, 84, 0.3);
}

.species-message {
  margin-top: 1rem;
  min-height: 20px;
}

/* ============================================
   5. LOCATION SECTION (Step 1)
   ============================================ */
.location-section {
  margin-top: 2rem;
}

.location-input-group {
  margin-bottom: 1.5rem;
}

.location-display {
  background: #fdfcfa;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border: 2px solid #e8e4d8;
}

.btn-live-location {
  background: linear-gradient(135deg, #c87941 0%, #d89158 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.9rem 1.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 0.75rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 3px 10px rgba(200, 121, 65, 0.3);
}

.btn-live-location:hover:not(:disabled) {
  background: linear-gradient(135deg, #b86a32 0%, #c88147 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(200, 121, 65, 0.4);
}

.btn-live-location:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.map-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  margin: 1.5rem 0;
  border: 2px solid #d4cdb8;
}

.map-hint {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-style: italic;
}

#osm-map {
  height: 350px;
  width: 100%;
  border-radius: 12px;
}

/* Date & Time Section */
.datetime-section {
  margin-top: 2rem;
}

/* Form Row (for side-by-side inputs) */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

/* ============================================
   8. RADIO BUTTONS
   ============================================ */
.radio-group {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.radio-input {
  display: none;
}

.radio-label {
  padding: 0.5rem 1.5rem;
  border: 2px solid #d4cdb8;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  background: #fafaf8;
  text-decoration: none !important;
  border-bottom: 2px solid #d4cdb8 !important;
}

.radio-label:hover {
  border-color: #6b9e3e;
  background: #f5f7f0;
  text-decoration: none !important;
  border-bottom: 2px solid #6b9e3e !important;
}

.radio-input:checked + .radio-yes,
.radio-input:checked + .radio-no,
.radio-input:checked + .radio-unknown {
  background: linear-gradient(135deg, #6b9e3e 0%, #8fbc5a 100%);
  color: white;
  border-color: #6b9e3e;
  border-bottom: 2px solid #6b9e3e !important;
  box-shadow: 0 2px 8px rgba(107, 158, 62, 0.3);
  text-decoration: none !important;
}

/* Step Pane Visibility */
.step-pane {
  display: none !important;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.step-pane.active {
  display: block !important;
  opacity: 1 !important;
  transform: translateY(0) !important;
}

/* ============================================
   9. NAVIGATION BUTTONS
   ============================================ */
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #f0ebe0;
}

.btn {
  padding: 0.9rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
  line-height: 1.6;
}

.btn-secondary {
  background: #f5f1e8;
  color: #666;
  border: 2px solid #d4cdb8;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #c4b89f;
  background: #ebe7dc;
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #6b9e3e 0%, #8fbc5a 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(107, 158, 62, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a8533 0%, #7aa849 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 158, 62, 0.4);
}

.btn-submit {
  background: linear-gradient(135deg, #3d6b2e 0%, #4a7d38 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(61, 107, 46, 0.3);
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #2d5016 0%, #3d6b2e 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(61, 107, 46, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Remove all underlines from links and ALL text elements */
a,
a:hover,
a:focus,
a:visited,
a:active {
  text-decoration: none !important;
  border-bottom: none !important;
}

/* Remove underlines from ALL text elements - COMPREHENSIVE */
*,
p,
span,
div,
label,
button,
h1, h2, h3, h4, h5, h6,
.form-label,
.helper-text,
.upload-text,
.upload-hint,
.map-hint,
.invalid-feedback,
.form-hint,
.section-title,
.form-title,
.step-label,
.input-icon,
.input-icon-label,
.upload-icon,
.species-message,
.required {
  text-decoration: none !important;
}

/* Remove border-bottom that creates underline effect from text (but keep borders on buttons/inputs) */
h1, h2, h3, h4, h5, h6,
.section-title,
.form-title,
.step-label,
.form-label,
label:not(.radio-label):not(.btn),
.upload-text,
.map-hint,
.helper-text,
.form-hint,
.invalid-feedback,
p,
span:not(.required),
div:not(.button-group):not(.content-card):not(.form-group):not(.form-row) {
  border-bottom: none !important;
  text-decoration: none !important;
}

/* ============================================
   11. HELPER TEXT
   ============================================ */
.helper-text {
  color: #777;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  font-style: italic;
  line-height: 1.6;
}

.invalid-feedback {
  color: #c85a54;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
  font-style: italic;
}

.form-hint {
  color: #777;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: block;
  font-style: italic;
  line-height: 1.6;
}

.species-message {
  margin-top: 1rem;
  min-height: 20px;
  background: linear-gradient(135deg, #e8f4f8 0%, #f0f8ff 100%);
  border: 2px solid #b8d9e8;
  border-radius: 12px;
  padding: 1rem;
  color: #2d5016;
}

/* ============================================
   12. RESPONSIVE DESIGN
   ============================================ */
@media (max-width: 768px) {
  .report-container {
    padding: 0 1rem;
  }
  
  .content-card {
    padding: 1.5rem;
  }
  
  .progress-indicator {
    font-size: 0.875rem;
  }
  
  .step-label {
    display: none;
  }
  
  .button-group {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

/* Status Message */
.status-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 6px;
}

/* Success Modal Styling */
.modal-content {
  border-radius: 20px;
  border: 2px solid #e8e4d8;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.modal-header {
  background: linear-gradient(135deg, #3d6b2e 0%, #4a7d38 100%);
  color: white;
  border-radius: 20px 20px 0 0;
  border-bottom: none;
}

.modal-title {
  font-weight: 600;
  color: white;
}
</style>

<style>
/* Global styles to hide footer and emergency strip on new-report page - IMMEDIATE */
/* These rules apply globally when on the new-report page */
body footer,
body .emergency-strip,
body .footer-body,
body [class*="footer"],
body [class*="emergency"],
body #footer,
body [id*="footer"],
body div#footer,
#app footer,
#app .emergency-strip,
#app .footer-body,
footer,
.emergency-strip,
.footer-body,
[class*="footer"]:not(.form-footer):not(.modal-footer),
[class*="emergency"],
#footer,
[id*="footer"],
div#footer,
body:has(.new-report-page) footer,
body:has(.new-report-page) .emergency-strip,
body:has(.new-report-page) .footer-body,
body:has(.new-report-page) [class*="footer"]:not(.form-footer):not(.modal-footer),
body:has(.new-report-page) [class*="emergency"],
#app:has(.new-report-page) footer,
#app:has(.new-report-page) .emergency-strip,
#app:has(.new-report-page) .footer-body,
.new-report-page ~ footer,
.new-report-page + footer {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0 !important;
  width: 0 !important;
  overflow: hidden !important;
  position: absolute !important;
  left: -9999px !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* EXPLICIT: Always show form-footer - override any hiding rules */
.new-report-page .form-footer,
.form-footer,
form .form-footer,
.form-card .form-footer {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  height: auto !important;
  width: 100% !important;
  position: relative !important;
  left: auto !important;
  margin-top: 3rem !important;
  padding-top: 2rem !important;
  padding-bottom: 1rem !important;
}

/* EXPLICIT: Always show navigation buttons */
.new-report-page .btn-next,
.new-report-page .btn-submit,
.new-report-page .btn-back,
.form-footer .btn-next,
.form-footer .btn-submit,
.form-footer .btn-back,
.footer-actions .btn-next,
.footer-actions .btn-submit {
  display: inline-flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative !important;
  left: auto !important;
  width: auto !important;
  height: auto !important;
}

/* Remove red/colored strips above navbar - target all possible sources */
body:has(.new-report-page)::before,
body:has(.new-report-page)::after,
html:has(.new-report-page)::before,
html:has(.new-report-page)::after,
body:has(.new-report-page) > div:first-child:not(#app):not(header):not(script):not(style),
body:has(.new-report-page) header::before,
body:has(.new-report-page) header::after,
body:has(.new-report-page) .customNavbar::before,
body:has(.new-report-page) .customNavbar::after,
body:has(.new-report-page) > *:not(#app):not(script):not(style):not(header):not(main) {
  display: none !important;
  content: none !important;
  height: 0 !important;
  width: 0 !important;
  visibility: hidden !important;
  background: transparent !important;
}

/* Ensure body and html have no margins/padding and clean background */
body:has(.new-report-page),
html:has(.new-report-page) {
  background: rgb(254, 250, 224) !important; /* #FEFAE0 - matches navbar and other pages */
  margin: 0 !important;
  padding: 0 !important;
}

/* Ensure header starts at the very top with no spacing */
body:has(.new-report-page) header,
body:has(.new-report-page) .customNavbar {
  margin-top: 0 !important;
  padding-top: 0 !important;
  top: 0 !important;
}

/* Remove any elements between body and #app */
body:has(.new-report-page) > *:not(#app):not(script):not(style) {
  display: none !important;
}
</style>

