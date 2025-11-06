<template>
  <transition name="mapnotify-fade">
    <div
      v-if="visible"
      class="mapnotify"
      :class="[`mapnotify--${type}`]"
      role="status"
      aria-live="polite"
      @click="handleClose"
    >
      <strong class="mapnotify__title" v-if="title">{{ title }}</strong>
      <span class="mapnotify__message">{{ message }}</span>
      <button class="mapnotify__close" aria-label="Close" @click.stop="handleClose">×</button>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'MapNotification',
  props: {
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    type: { type: String, default: 'info' }, // info | success | warning | error
    duration: { type: Number, default: 3000 },
  },
  data() {
    return { visible: false, _timer: null };
  },
  methods: {
    show() {
      this.clearTimer();
      this.visible = true;
      if (this.duration > 0) {
        this._timer = setTimeout(() => this.handleClose(), this.duration);
      }
    },
    handleClose() {
      this.clearTimer();
      this.visible = false;
      this.$emit('close');
    },
    clearTimer() {
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
      }
    },
  },
  beforeUnmount() {
    this.clearTimer();
  },
};
</script>

<style scoped>
.mapnotify {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1100;
  background: #ffffff;
  color: #1f2937;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  border-radius: 10px;
  padding: 12px 40px 12px 14px;
  max-width: 320px;
  line-height: 1.4;
  cursor: pointer;
}
.mapnotify--success { border-color: #10b981; }
.mapnotify--warning { border-color: #f59e0b; }
.mapnotify--error { border-color: #ef4444; }
.mapnotify__title { display: block; font-weight: 700; margin-bottom: 4px; }
.mapnotify__message { display: inline-block; }
.mapnotify__close {
  position: absolute;
  top: 6px;
  right: 8px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  color: #374151;
}
.mapnotify-fade-enter-active, .mapnotify-fade-leave-active { transition: opacity .2s ease, transform .2s ease; }
.mapnotify-fade-enter-from, .mapnotify-fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>


