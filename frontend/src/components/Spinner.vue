<template>
  <!-- Overlay/fullscreen variant -->
  <div v-if="overlay || fullscreen" class="spinner-overlay" :class="{ fullscreen }" role="status" aria-live="polite">
    <div class="spinner-container">
      <div class="spinner" :style="styleVars"></div>
      <div v-if="label" class="spinner-label">{{ label }}</div>
    </div>
  </div>

  <!-- Inline variant -->
  <div v-else class="spinner-inline" role="status" aria-live="polite">
    <div class="spinner" :style="styleVars"></div>
    <div v-if="label" class="spinner-label">{{ label }}</div>
  </div>
  
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: [Number, String], default: 32 },
  color: { type: String, default: '#046848' },
  trackColor: { type: String, default: 'rgba(0,0,0,0.1)' },
  strokeWidth: { type: [Number, String], default: 3 },
  label: { type: String, default: '' },
  overlay: { type: Boolean, default: false },
  fullscreen: { type: Boolean, default: false }
})

const toPx = (v, fallback) => {
  if (v === undefined || v === null || v === '') return fallback
  return typeof v === 'number' ? `${v}px` : `${v}`
}

const styleVars = computed(() => ({
  '--spinner-size': toPx(props.size, '32px'),
  '--spinner-width': toPx(props.strokeWidth, '3px'),
  '--spinner-color': props.color,
  '--spinner-track': props.trackColor
}))
</script>

<style scoped>
.spinner {
  width: var(--spinner-size);
  height: var(--spinner-size);
  border-radius: 50%;
  box-sizing: border-box;
  border: var(--spinner-width) solid var(--spinner-track);
  border-top-color: var(--spinner-color);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner-inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.spinner-label {
  font-size: 0.9rem;
  color: #333;
}

.spinner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.spinner-overlay.fullscreen {
  position: fixed;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  backdrop-filter: blur(2px);
}
</style>

