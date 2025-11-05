<template>
  <div v-if="isPopup" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Thank you for accepting the case!</h2>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submitForm">
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
  },
  data() {
    return {
      formData: {
        minutes: null
      },
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
      this.$emit('confirm', payload)
      this.closeModal()
    },

    resetForm() {
      this.formData.minutes = null
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

h2 {
  color: #065f46;
  margin-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.subtitle { color: #666; font-size: 14px; margin-top: 4px; margin-bottom: 10px; }

.minutes-row { display: flex; align-items: center; gap: 8px; }
.minutes-row input[type="number"] { width: 140px; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; }
.minutes-row input[type="number"]:focus { outline: none; border-color: #34d399; box-shadow: 0 0 0 3px rgba(52,211,153,0.1); }
.unit-label { color: #555; font-size: 14px; }



.hint-text {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.submit-button {
  background-color: #34d399;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 600;
}

.submit-button:hover {
  background-color: #10b981;
}

.cancel-button {
  background-color: #e0e0e0;
  color: #333;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
}

.cancel-button:hover {
  background-color: #d0d0d0;
}
</style>