<template>
  <div>
    <!-- Floating Animals Background -->
    <div class="floating-animals">
      <div
        v-for="(animal, index) in floatingAnimals"
        :key="index"
        class="floating-animal"
        :style="getAnimalStyle(index)"
      >
        {{ animal }}
      </div>
    </div>

    <!-- Decorative Leaves -->
    <div class="leaf leaf-top">🍃</div>
    <div class="leaf leaf-bottom">🍃</div>
  </div>
</template>

<script>
export default {
  name: 'FloatingBackground',
  data() {
    return {
      floatingAnimals: ['🦊', '🦝', '🐿️', '🦔', '🦉', '🦌', '🐰', '🦫', '🐻', '🦅', '🐺', '🦜']
    };
  },
  methods: {
    getAnimalStyle(index) {
      return {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${15 + Math.random() * 10}s`
      };
    }
  }
};
</script>

<style scoped>
/* Floating Animals */
.floating-animals {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  overflow: hidden !important;
  box-sizing: border-box !important;
}

.floating-animal {
  position: absolute;
  font-size: 40px;
  opacity: 0.15;
  animation: float 20s infinite ease-in-out;
  max-width: 100vw;
  overflow: hidden;
}

@keyframes float {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  25% { transform: translate(30px,-30px) rotate(10deg); }
  50% { transform: translate(-20px,20px) rotate(-10deg); }
  75% { transform: translate(40px,10px) rotate(5deg); }
}

/* Decorative Leaves */
.leaf {
  position: fixed;
  font-size: 80px;
  opacity: 0.1;
  color: #10b981;
  pointer-events: none;
  z-index: 0;
  max-width: 100vw;
  overflow: hidden;
}

.leaf-top { top: 40px; left: 40px; }
.leaf-bottom { bottom: 40px; right: 40px; transform: rotate(180deg); }
</style>
