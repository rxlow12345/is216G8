<template>
  <div v-if="isPopup" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-body">
        <!-- Success State -->
        <div v-if="isSuccess" class="success-content">
          <div class="success-message">
            <h2>Thank you for accepting the report!</h2>
            <p class="success-link-container">
              <a href="#" @click.prevent="openRescueStages" class="success-link">
                Click here to update rescue stages
              </a>
            </p>
          </div>
          <div class="modal-actions">
            <button type="button" class="close-button" @click="closeModal">
              Close
            </button>
          </div>
        </div>
        
        <!-- Form State -->
        <form v-else @submit.prevent="submitForm">
          <div class="form-group">
            <label for="eta-minutes">
              How long until you reach the location? *
            </label>
            <div class="subtitle">{{ location }}</div>
            <div class="minutes-row">
              <input 
                id="eta-minutes"
                type="number"
                inputmode="numeric"
                v-model.number="formData.minutes"
                placeholder="e.g., 15"
                min="1"
                max="180"
                required
              />
              <span class="unit-label">minutes</span>
            </div>
            <small class="hint-text">Enter estimated travel time in minutes</small>
          </div>
        
          <div class="modal-actions">
            <button type="button" class="cancel-button" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="submit-button">Confirm Acceptance</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'acceptCaseModal',
  props: {
    isPopup: {
      type: Boolean,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    reportId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      formData: {
        minutes: null
      },
      isSuccess: false,
    }
  },
  watch: {
    isPopup(newVal) {
      // Reset success state when modal is closed and reopened
      if (!newVal) {
        this.isSuccess = false;
      }
    }
  },
  computed: {
    
  },
  methods: {
    closeModal() {
      this.$emit('close');
      this.resetForm();
    },

    submitForm() {
      const m = Number(this.formData.minutes)
      if (!Number.isFinite(m) || m < 1 || m > 180) {
        alert('Please enter a valid duration between 1 and 180 minutes')
        return
      }
      const payload = { minutes: m, location: this.location }
      // Emit confirm event but don't close modal yet
      this.$emit('confirm', payload)
      // Show success state
      this.isSuccess = true
    },
    
    openRescueStages() {
      // Emit event to open rescue stages modal
      this.$emit('open-rescue-stages', this.reportId)
      // Close this modal
      this.closeModal()
    },

    resetForm() {
      this.formData.minutes = null
      this.isSuccess = false
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Above drawer (1100) */
  font-family: Georgia, 'Times New Roman', Times, serif;
  padding: 20px; /* Add padding for mobile */
}

.modal-content {
  background: #FEFAE0; /* Cream/beige background matching CritterConnect theme */
  padding: 24px;
  border-radius: 20px; /* More rounded corners */
  width: 90%;
  max-width: 420px;
  box-shadow: 0 8px 24px rgba(101, 67, 33, 0.2), 0 4px 12px rgba(101, 67, 33, 0.15); /* Warm-toned shadow */
  border: 1px solid rgba(101, 67, 33, 0.1); /* Subtle warm border */
  position: relative;
  margin: auto;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d5016; /* Deep green */
  font-size: 1rem;
}

.subtitle {
  color: rgba(101, 67, 33, 0.8); /* Warm gray-brown */
  font-size: 14px;
  font-style: italic;
  margin-top: 4px;
  margin-bottom: 12px;
}

.minutes-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.minutes-row input[type="number"] {
  width: 140px;
  padding: 10px 12px;
  border: 1px solid rgba(101, 67, 33, 0.3);
  border-radius: 8px;
  font-size: 16px;
  background: #FFFFFF;
  color: #2d5016;
  transition: all 0.2s ease;
}

.minutes-row input[type="number"]:focus {
  outline: none;
  border-color: #285436; /* Deep green focus */
  box-shadow: 0 0 0 3px rgba(40, 84, 54, 0.15); /* Green glow */
  background: #FFFFFF;
}

.unit-label {
  color: #2d5016; /* Deep green */
  font-size: 14px;
  font-weight: 500;
}

.hint-text {
  display: block;
  margin-top: 6px;
  color: rgba(101, 67, 33, 0.7); /* Warm gray-brown */
  font-size: 13px;
}

.modal-actions {
  display: flex;
  justify-content: space-between; /* Cancel left, Confirm right */
  gap: 10px; /* Spacing between buttons */
  margin-top: 20px;
}

.submit-button {
  background-color: #285436; /* Deep green matching system */
  color: rgb(254, 250, 224); /* Cream text */
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 2px 6px rgba(40, 84, 54, 0.3);
  white-space: nowrap; /* Prevent text wrapping */
}

.submit-button:hover {
  background-color: #2d5016; /* Darker green on hover */
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(40, 84, 54, 0.4);
}

.submit-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(40, 84, 54, 0.3);
}

.cancel-button {
  background-color: rgba(101, 67, 33, 0.15); /* Light warm gray */
  color: #2d5016; /* Deep green text */
  padding: 8px 16px;
  border: 1px solid rgba(101, 67, 33, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
  white-space: nowrap; /* Prevent text wrapping */
}

.cancel-button:hover {
  background-color: rgba(101, 67, 33, 0.25);
  border-color: rgba(101, 67, 33, 0.4);
}

/* Success State Styles */
.success-content {
  text-align: center;
}

.success-message {
  margin-bottom: 20px;
}

.success-message h2 {
  color: #2d5016; /* Deep green matching system theme */
  margin: 0 0 16px 0;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.success-link-container {
  margin: 16px 0;
}

.success-link {
  color: #285436; /* Deep green */
  text-decoration: underline;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.success-link:hover {
  color: #2d5016; /* Darker green on hover */
  text-decoration: underline;
}

.close-button {
  background-color: #285436; /* Deep green matching system */
  color: rgb(254, 250, 224); /* Cream text */
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 2px 6px rgba(40, 84, 54, 0.3);
  white-space: nowrap;
}

.close-button:hover {
  background-color: #2d5016; /* Darker green on hover */
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(40, 84, 54, 0.4);
}

.close-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(40, 84, 54, 0.3);
}
</style>