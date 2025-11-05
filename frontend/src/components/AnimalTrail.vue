<template>
  <div class="animal-trail-container">
    <transition-group name="trail" tag="div">
      <span
        v-for="(animal, index) in animals"
        :key="animal.id"
        class="trail-animal"
        :style="{
          top: animal.y + 'px',
          left: animal.x + 'px',
          fontSize: animal.size + 'px',
          opacity: animal.opacity
        }"
      >
        {{ animal.icon }}
      </span>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const animals = ref([]);
let nextId = 0;
let lastSpawnTime = 0;
const spawnDelay = 90; //adjust to decrease animals

const animalIcons = ['🐾', '🦊', '🐰', '🦝', '🦦'];

function isOverAuthCard(x, y) {
  const authCard = document.querySelector('.auth-card');
  if (!authCard) return false;
  
  const rect = authCard.getBoundingClientRect();
  return (
    x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom
  );
}

function spawnAnimalTrail(event) {
  const now = Date.now();
  
  if (now - lastSpawnTime < spawnDelay) return;
  lastSpawnTime = now;
  
  if (isOverAuthCard(event.clientX, event.clientY)) return;
  
  const animal = {
    id: nextId++,
    icon: animalIcons[Math.floor(Math.random() * animalIcons.length)],
    x: event.clientX + (Math.random() * 20 - 10),
    y: event.clientY + (Math.random() * 20 - 10),
    size: 20 + Math.random() * 10,
    opacity: 1
  };

  animals.value.push(animal);

  // Fade out gradually
  const startTime = Date.now();
  const fadeDuration = 800;
  
  const fadeInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / fadeDuration;
    
    animal.opacity = Math.max(0, 1 - progress);
    
    if (progress >= 1) {
      animals.value = animals.value.filter(a => a.id !== animal.id);
      clearInterval(fadeInterval);
    }
  }, 16);
}

onMounted(() => {
  window.addEventListener('mousemove', spawnAnimalTrail);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', spawnAnimalTrail);
});
</script>

<style scoped>
.animal-trail-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; 
  z-index: 5; 
  overflow: hidden;
}

.trail-animal {
  position: absolute;
  pointer-events: none;
  user-select: none;
  transition: opacity 0.6s ease-out;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.trail-animal {
  animation: float 1s ease-in-out;
}
</style>