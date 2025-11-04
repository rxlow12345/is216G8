<template>
  <transition name="slide-fade">
    <div v-if="visible" class="notification" :class="type">
      <div class="notification-content">
        <span class="notification-icon">{{ icon }}</span>
        <div class="notification-text">
          <h4>{{ title }}</h4>
          <p>{{ message }}</p>
        </div>
        <button @click="close" class="close-btn">×</button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Notification',
  props: {
    title: String,
    message: String,
    type: {
      type: String,
      default: 'success', // success, error, info, warning
    },
    duration: {
      type: Number,
      default: 6000,
    }
  },
  data() {
    return {
      visible: false,
    }
  },
  computed: {
    icon() {
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };
      return icons[this.type] || icons.info;
    }
  },
  methods: {
    show() {
      this.visible = true;
      if (this.duration > 0) {
        setTimeout(() => {
          this.close();
        }, this.duration);
      }
    },
    close() {
      this.visible = false;
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  min-width: 300px;
  max-width: 500px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
}

.notification.success {
  border-left: 4px solid #10b981;
}

.notification.success .notification-icon {
  color: #10b981;
  background: #d1fae5;
}

.notification.error {
  border-left: 4px solid #ef4444;
}

.notification.error .notification-icon {
  color: #ef4444;
  background: #fee2e2;
}

.notification.warning {
  border-left: 4px solid #f59e0b;
}

.notification.warning .notification-icon {
  color: #f59e0b;
  background: #fef3c7;
}

.notification.info {
  border-left: 4px solid #3b82f6;
}

.notification.info .notification-icon {
  color: #3b82f6;
  background: #dbeafe;
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
}

.notification-text {
  flex: 1;
}

.notification-text h4 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.notification-text p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #4b5563;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
