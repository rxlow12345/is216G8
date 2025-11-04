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
    },
    openStatusInNewTab(reportId) {
      const routeData = this.$router.resolve({
        name: 'Status', // The name of the route
        params: { id: reportId } // The dynamic part of the URL
      });
      window.open(routeData.href, '_blank');
    }
  }
}


</script>

<template>
  <Transition name="modal">
    <div v-if="selectedReport" class="modal-mask">
      <!-- Modal -->
      <div class="modal fade show" style="display: block;" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down modal-lg">
          <div class="modal-content custom-modal shadow-lg">
            <div class="modal-header custom-modal-header">
              <h5 class="modal-title">
                <i class="bi bi-file-earmark-check me-2"></i>
                Report Details: {{ selectedReport.reportId }}
              </h5>
              <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
            </div>
            <div class="modal-body p-4">
              <div class="row g-4 flex-column flex-md-row">
                <div class="col-12 col-md-5 d-flex justify-content-center"
                  v-if="selectedReport.photoURLs && selectedReport.photoURLs.length > 0">
                  <img :src="selectedReport.photoURLs[0]" class="img-fluid rounded-4 modal-image w-100"
                    alt="Report Photo">
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
                        <span class="ms-2">{{ capitalise(selectedReport.location.address) }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <i class="bi bi-calendar-event info-icon"></i>
                      <div>
                        <strong>Reported:</strong>
                        <span class="ms-2">{{ convertDate(selectedReport.sightingDateTime) }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <i class="bi bi-chat-left-text info-icon"></i>
                      <div>
                        <strong>Description:</strong>
                      </div>
                    </div>
                    <p class="description-text mt-2 mb-0">{{ selectedReport.description }}</p>
                    <hr class="my-3">
                    <div class="info-row">
                      <i class="bi bi-person-circle info-icon"></i>
                      <div>
                        <strong>Reporter Email:</strong>
                        <span class="ms-2">{{ selectedReport.email }}</span>
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
            <div class="custom-modal-buttons d-flex flex-wrap align-items-center gap-2">
              <!-- Close & View Details -->
              <div class="d-flex flex-wrap gap-2 w-100 w--auto">
                <button type="button" class="btn custom-btn-close flex-fill" @click="$emit('close')">
                  <i class="bi bi-x-circle me-2"></i>Close
                </button>
                <button type="button" class="btn custom-btn-view-details flex-fill"
                  @click="openStatusInNewTab(selectedReport.reportId)">
                  <i class="bi bi-box-arrow-up-right me-2"></i>View Full Details
                </button>
              </div>

              <!-- Status Buttons -->
              <div class="d-flex justify-content-center gap-2 flex-wrap w-100">
                <button type="button" class="btn custom-btn-pending flex-fill"
                  @click="$emit('statusChange', selectedReport.id, 'pending')">
                  <i class="bi bi-pause-circle me-2"></i>Set Pending
                </button>
                <button type="button" class="btn custom-btn-active flex-fill"
                  @click="$emit('statusChange', selectedReport.id, 'active')">
                  <i class="bi bi-play-circle me-2"></i>Set Active
                </button>
                <button type="button" class="btn custom-btn-resolved flex-fill"
                  @click="$emit('statusChange', selectedReport.id, 'resolved')">
                  <i class="bi bi-check-circle me-2"></i>Set Resolved
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      <!-- Backdrop for the modal -->
      <div v-if="selectedReport" class="modal-backdrop fade show"></div>
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

/* Media query for tablet-sized screens and up */
@media (min-width: 768px) {
  .modal-dialog.modal-lg {
    max-width: 90%; /* You can adjust this percentage */
  }
}

/* Media query for tablet-sized screens and up */
@media (min-width: 992px) {
  .modal-dialog.modal-lg {
    max-width: 75%; /* You can adjust this percentage */
  }
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
  align-items: center;
  color: #606C38;
}

.description-row {
  flex-basis: 100%;
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

.custom-modal-buttons {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  padding: calc(var(--bs-modal-padding) - var(--bs-modal-footer-gap) * 0.5);
  background-color: var(--bs-modal-footer-bg);
  border-top: var(--bs-modal-footer-border-width) solid var(--bs-modal-footer-border-color);
  border-bottom-right-radius: var(--bs-modal-inner-border-radius);
  border-bottom-left-radius: var(--bs-modal-inner-border-radius);
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  /* padding: 1.25rem 1.5rem; */
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

.custom-btn-close {
  background: #A95C52;
  color: white;
  padding: 16px 32px;
  border-radius: 15px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
  border: none;
  transition: all 0.3s ease;
}

.custom-btn-close:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(8, 97, 67, 0.4);
}

.custom-btn-view-details {
  background: #3D4C53;
  color: white;
  padding: 16px 32px;
  border-radius: 15px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
  border: none;
  transition: all 0.3s ease;
}

.custom-btn-view-details:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(8, 97, 67, 0.4);
}

.custom-btn-pending {
  background: #BC6C25;
  color: white;
  padding: 16px 32px;
  border-radius: 15px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
  border: none;
  transition: all 0.3s ease;
}

.custom-btn-pending:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(8, 97, 67, 0.4);
}

.custom-btn-active {
  background: #15aa78;
  color: white;
  padding: 16px 32px;
  border-radius: 15px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
  border: none;
  transition: all 0.3s ease;
}

.custom-btn-active:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 203, 89, 0.4);
}

.custom-btn-resolved {
  background: #086143;
  color: white;
  padding: 16px 32px;
  border-radius: 15px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
  border: none;
  transition: all 0.3s ease;
}

.custom-btn-resolved:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(8, 97, 67, 0.4);
}
</style>