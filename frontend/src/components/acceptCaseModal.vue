<template>
  <div v-if="isPopup" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Thank you for accepting the case!</h2>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submitForm">
          
          <div class="form-group">
            <label for="eta-time">
              What time will you reach <strong>{{ location }}</strong>? *
            </label>
          <input 
          id="eta-time"
          type="time" 
          v-model="formData.time"
          required
          />
          <small class="hint-text">Select your estimated arrival time</small>
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
        date: '',
        time: ''
      },
    }
  },
  computed: {
    todayDate() {
      return new Date().toISOString().split('T')[0];
    },
    currentTime() {
      const now = new Date();
      return now.toTimeString().slice(0, 5); // Returns HH:MM format
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
      this.resetForm();
    },

    submitForm() {
      if (!this.formData.time) {
        alert('Please select an arrival time');
        return;
      }
      const now = new Date();
      const [hours, minutes] = this.formData.time.split(':').map(Number);
      const selectedDateTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        0, // seconds
        0 // milliseconds
      );

      if (selectedDateTime <= now) {
        console.log('Selected time:', selectedDateTime);
        console.log('Current time:', now);
        alert('Please select a future time. The arrival time cannot be in the past.');
        return;
      }
      const submissionData = {
        date: this.todayDate, 
        time: this.formData.time, 
        timestamp: selectedDateTime.toISOString(), 
        location: this.location
      };

      // will emit the 'confirm event' with data
      this.$emit('confirm', submissionData);
      this.closeModal();
    },

    resetForm() {
      this.formData.date = '';
      this.formData.time = '';
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

.form-group input[type="date"],
.form-group input[type="time"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.form-group input[type="date"]:focus,
.form-group input[type="time"]:focus {
  outline: none;
  border-color: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
}

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