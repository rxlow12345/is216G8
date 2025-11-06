<template>
  <transition name="modal-fade">
    <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
      <div class="new-report-modal" @click.stop>
        <div class="new-report-modal__header">
          <h2 class="new-report-modal__title">{{ title }}</h2>
          <button class="close-btn" @click="close" aria-label="Close modal">
            &times;
          </button>
        </div>

        <div class="new-report-modal__content">
          <div class="success-message">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div class="success-text">
              <h3>{{ message }}</h3>
              <p>{{ description }}</p>
            </div>
          </div>

          <div class="details">
            <div class="detail-item">
              <span class="detail-label">Report ID:</span>
              <span class="detail-value">{{ reportId }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="detail-value status">{{ status }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Priority:</span>
              <span class="detail-value priority" :class="priorityClass">{{
                displayPriority
              }}</span>
            </div>
          </div>

          <div class="info-box">
            <span class="info-icon">i</span>
            <p class="info-text">{{ infoMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "NewReportPopup",
  props: {
    title: {
      type: String,
      default: "Report Submitted",
    },
    message: {
      type: String,
      default: "Report submitted successfully!",
    },
    description: {
      type: String,
      default:
        "Your wildlife rescue report has been received and is being processed.",
    },
    reportId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    priority: {
      type: String,
      default: "High",
    },
    infoMessage: {
      type: String,
      default:
        "You will be contacted if further information is needed. Thank you for helping protect wildlife!",
    },
  },
  computed: {
    priorityClass() {
      const p = this.priority.toLowerCase();
      if (p === "low") return "priority-low";
      if (p === "medium") return "priority-medium";
      if (p === "high") return "priority-high";
      return "priority-low";
    },
    displayPriority() {
      const p = this.priority.toLowerCase();
      if (p === "low") return "Low";
      if (p === "moderate") return "Moderate";
      if (p === "urgent" || p === "high") return "Urgent";
      return this.priority;
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    show() {
      this.visible = true;
      document.body.style.overflow = "hidden";
    },
    close() {
      this.visible = false;
      document.body.style.overflow = "";
      this.$emit("close");
    },
    handleOverlayClick() {
      this.close();
    },
    handleEscape(e) {
      if (e.key === "Escape" && this.visible) {
        this.close();
      }
    },
  },
  mounted() {
    document.addEventListener("keydown", this.handleEscape);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleEscape);
    document.body.style.overflow = "";
  },
};
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 32px 20px;
}

/* Modal Container */
.new-report-modal {
  background: white;
  border-radius: 16px;
  width: min(50vw, 440px);
  max-width: 100%;
  /* height: 85vh; */
  max-height: 85vh;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0 auto;
}

/* Modal Header */
.new-report-modal__header {
  background: #1a5f47;
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.new-report-modal__title {
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
  line-height: 1;
  opacity: 0.8;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

.close-btn:active {
  transform: scale(0.95);
}

/* Modal Content */
.new-report-modal__content {
  padding: 22px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Success Icon */
.success-icon {
  width: 56px;
  height: 56px;
  background: #d4edda;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  flex-shrink: 0;
  animation: scaleIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) 0.2s backwards;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.success-icon svg {
  width: 32px;
  height: 32px;
  stroke: #1a5f47;
  stroke-width: 3;
}

/* Success Message */
/* Parent container: aligns icon + text */
.success-message {
  display: grid;
  grid-template-columns: auto 1fr;  /* ✅ icon left, text right */
  align-items: center;              /* ✅ vertical middle alignment */
  column-gap: 12px;                 /* gap between icon & text */
  /* margin-bottom: 12px; */
  text-align: left;
}

/* Make the text block line up neatly */
.success-text {
  display: flex;
  flex-direction: column;
  justify-content: center;   /* ✅ ensures h3 + p center vertically */
  text-align: left;
}

/* Title */
.success-text h3 {
  color: #1a5f47;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 0px;       /* ✅ smaller spacing between h3 and p */
}

/* Description */
.success-text p {
  color: #666;
  padding-left: 0;
  font-size: 14px;
  margin: 0;
  line-height: 1;      /* ✅ slightly tighter line height */
}

/* Ensure the success-icon stays centered visually */
.success-icon {

  flex-shrink: 0;         /* ✅ prevents shrinking/misalignment */
  display: flex;
  margin: 0;
  padding: 0;
  align-items: center;
  justify-content: center;
}

/* Details Section */
.details {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  /* padding: 15px; */
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.detail-label {
  font-weight: 600;
  color: #1a1a1a;
  text-align: left;
  flex: 0 0 140px;
}

.detail-value {
  color: #285436;
  font-weight: 500;
  word-break: break-word;
  text-align: left;
  flex: 1 1 auto;
}

.detail-value.status {
  color: #285436;
  padding-left: 0;
  margin: 0;
  text-transform: capitalize;
}
/* Priority Color Coding */
.detail-value.priority-low {
    color: #6B8E23 !important;
    /* font-weight: 500; */
    text-transform: capitalize;
}

.detail-value.priority-medium {
    color: #ff8c00 !important;
    /* font-weight: 600; */
    text-transform: capitalize;
}

.detail-value.priority-high {
    color: #dc3545 !important;
    /* font-weight: 600; */
    text-transform: capitalize;
}

/* Info Box */
.info-box {
  background: #e3f2fd;
  border-left: 4px solid #5b8db8;
  padding: 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-icon {
  width: 24px;
  height: 24px;
  background: #5b8db8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  flex-shrink: 0;
  font-size: 13px;
}

.info-text {
  color: #1a1a1a;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

/* Transitions */
.modal-fade-enter-active {
  transition: opacity 0.25s ease;
}

.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .new-report-modal {
  animation: slideUp 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive */
/* Tablet Responsive (600px - 768px) */
@media (max-width: 768px) and (min-width: 601px) {
  .new-report-modal {
    width: min(70vw, 420px);
  }
  
  .new-report-modal__header {
    padding: 16px 20px;
  }
  
  .new-report-modal__content {
    padding: 20px 18px;
  }
  
  .success-icon {
    width: 52px;
    height: 52px;
  }
  
  .success-icon svg {
    width: 28px;
    height: 28px;
  }
}

/* Mobile Responsive (max 600px) */
@media (max-width: 600px) {
  .modal-overlay {
    padding: 24px 16px;
    overflow-y: auto;
  }
  
  .new-report-modal {
    width: 100%;
    max-width: 100%;
    /* height: 85vh; */
    /* max-height: 85vh; */
    margin: 0 auto;
  }
  
  .new-report-modal__header {
    padding: 16px 18px;
  }
  
  .new-report-modal__title {
    font-size: 18px;
  }
  
  .close-btn {
    width: 26px;
    height: 26px;
    font-size: 26px;
  }
  
  .new-report-modal__content {
    padding: 20px 16px;
  }
  
  .success-message {
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .success-icon {
    width: 48px;
    height: 48px;
  }
  
  .success-icon svg {
    width: 26px;
    height: 26px;
  }
  
  .success-text h3 {
    font-size: 16px;
  }
  
  .success-text p {
    font-size: 13px;
  }
  
  .details {
    padding: 14px;
    margin-bottom: 16px;
  }
  
  .detail-item {
    font-size: 13px;
    gap: 10px;
  }
  
  .detail-label {
    font-size: 13px;
    flex: 0 0 120px;
  }
  
  .detail-value {
    font-size: 13px;
  }
  
  .info-box {
    padding: 10px;
    gap: 8px;
  }
  
  .info-icon {
    width: 20px;
    height: 20px;
    font-size: 12px;
  }
  
  .info-text {
    font-size: 12px;
  }
}

/* Very Small Phones (max 375px) */
@media (max-width: 375px) {
  .modal-overlay {
    padding: 12px;
    overflow-y: auto;
  }
  
  .new-report-modal__header {
    padding: 14px 16px;
  }
  
  .new-report-modal__title {
    font-size: 17px;
  }
  
  .new-report-modal__content {
    padding: 18px 14px;
  }
  
  .success-text h3 {
    font-size: 15px;
  }
  
  .success-text p {
    font-size: 12px;
  }
  
  .details {
    padding: 12px;
  }
  
  .detail-item {
    font-size: 12px;
  }
  
  .detail-label {
    flex: 0 0 110px;
  }
  
  .detail-value {
    font-size: 12px;
  }
  
  .info-text {
    font-size: 11px;
  }
}
</style>
