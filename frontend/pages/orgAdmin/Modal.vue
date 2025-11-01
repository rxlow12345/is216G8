<script>
export default {
  props: ['selectedReport'],
  emits: ['close', 'statusChange'],
  methods: {
    convertDate(timeStamp) {
      const date = new Date(timeStamp._seconds * 1000);
      const options = {
        timeZone: 'Asia/Singapore', // This sets the timezone to GMT+8
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      const formattedDate = date.toLocaleString('en-US', options);
      return formattedDate;
    },
    capitalise(val) {
      return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }
  }
}


</script>

<template>
  <Transition name="modal">
    <div v-if="selectedReport" class="modal-mask">
      <!-- Modal -->
      <div v-if="selectedReport" class="modal fade show" style="display: block;" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content custom-modal shadow-lg">
            <div class="modal-header custom-modal-header">
              <h5 class="modal-title">
                <i class="bi bi-file-earmark-check me-2"></i>
                Report Details: {{ selectedReport.reportId }}
              </h5>
              <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
            </div>
            <div class="modal-body p-4">
              <div class="row g-4">
                <div class="col-md-5" v-if="selectedReport.photoURLs && selectedReport.photoURLs.length > 0">
                  <img :src="selectedReport.photoURLs[0]" class="img-fluid rounded-4 modal-image" alt="Report Photo">
                </div>
                <div :class="selectedReport.photoURLs && selectedReport.photoURLs.length > 0 ? 'col-md-7' : 'col-12'">
                  <div class="modal-info-section">
                    <div class="info-row">
                      <i class="bi bi-award info-icon"></i>
                      <div>
                        <strong>Species:</strong>
                        <span class="ms-2">{{ selectedReport.speciesName || 'Not specified' }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <i class="bi bi-flag info-icon"></i>
                      <div>
                        <strong>Status:</strong>
                        <span :class="['status-badge ms-2', `status-${selectedReport.status}`]">
                          {{ capitalise(selectedReport.status) }}
                        </span>
                      </div>
                    </div>
                    <div class="info-row">
                      <i class="bi bi-geo-alt info-icon"></i>
                      <div>
                        <strong>Location:</strong>
                        <span class="ms-2">{{ capitalise(selectedReport.location) }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <i class="bi bi-calendar-event info-icon"></i>
                      <div>
                        <strong>Sighting Time:</strong>
                        <span class="ms-2">{{ convertDate(selectedReport.sightingDateTime) }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <i class="bi bi-chat-left-text info-icon"></i>
                      <div>
                        <strong>Description:</strong>
                        <p class="description-text mt-2 mb-0">{{ selectedReport.description }}</p>
                      </div>
                    </div>
                    <hr class="my-3">
                    <div class="info-row">
                      <i class="bi bi-person-circle info-icon"></i>
                      <div>
                        <strong>Reporter Contact:</strong>
                        <span class="ms-2">{{ selectedReport.contactEmail }} | {{ selectedReport.contactPhone
                        }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <i class="bi bi-exclamation-triangle info-icon"></i>
                      <div>
                        <strong>Urgent:</strong>
                        <span :class="['ms-2', selectedReport.isUrgent ? 'text-danger fw-bold' : 'text-muted']">
                          {{ selectedReport.isUrgent ? 'Yes, Urgent ⚠️' : 'No' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer custom-modal-footer">
              <button type="button" class="btn btn-outline-secondary custom-btn-outline" @click="$emit('close')">
                <i class="bi bi-x-circle me-2"></i>Close
              </button>
              <button type="button" class="btn custom-btn-active"
                @click="$emit('statusChange',selectedReport.id, 'active')">
                <i class="bi bi-play-circle me-2"></i>Set Active
              </button>
              <button type="button" class="btn custom-btn-resolved"
                @click="$emit('statusChange',selectedReport.id, 'resolved')">
                <i class="bi bi-check-circle me-2"></i>Set Resolved
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Backdrop for the modal -->
      <!-- <div v-if="selectedReport" class="modal-backdrop fade show"></div> -->

      <div class="modal-container">
        <div class="modal-header">
          <slot name="header">default header</slot>
        </div>

        <div class="modal-body">
          <slot name="body">default body</slot>
        </div>

        <div class="modal-footer">
          <slot name="footer">
            default footer
            <button class="modal-default-button" @click="$emit('close')">OK</button>
          </slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  width: 300px;
  margin: auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

/* Custom Modal */
.custom-modal {
  border: none;
  border-radius: 20px;
  overflow: hidden;
}

.custom-modal-header {
  background: linear-gradient(135deg, #086143 0%, #046949 100%);
  color: white;
  padding: 1.5rem;
  border-bottom: none;
}

.custom-modal-header .modal-title {
  font-weight: 600;
  font-size: 1.25rem;
}

.modal-image {
  border: 3px solid #086143;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modal-info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  color: #606C38;
}

.info-icon {
  color: #086143;
  font-size: 1.25rem;
  width: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.description-text {
  background-color: #FEFAE0;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 3px solid #086143;
  line-height: 1.6;
}

.custom-modal-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 1.25rem 1.5rem;
}

.custom-btn-outline {
  border: 2px solid #606C38;
  color: #606C38;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.custom-btn-outline:hover {
  background-color: #606C38;
  color: white;
}

.custom-btn-active {
  background: linear-gradient(135deg, #16cb59 0%, #15aa78 100%);
  color: white;
  border: none;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.custom-btn-active:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 203, 89, 0.4);
}

.custom-btn-resolved {
  background: linear-gradient(135deg, #086143 0%, #046949 100%);
  color: white;
  border: none;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.custom-btn-resolved:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(8, 97, 67, 0.4);
}
</style>