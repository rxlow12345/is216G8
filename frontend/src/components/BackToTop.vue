<template>
  <button 
    v-show="visible" 
    class="back-to-top" 
    @click="scrollToTop"
    aria-label="Back to top"
  >
    <span class="arrow">&#8679;</span>
    <span class="text">Back to Top</span>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const visible = ref(false);

function handleScroll() {
  visible.value = window.scrollY > 300;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: #285436;
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 10px 18px;
  font-size: 0; 
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.3s ease, background-color 0.3s ease, opacity 0.3s ease;
  z-index: 9999;
}

.back-to-top:hover {
  transform: scale(1.05);
  background-color: #10b981;
}

.arrow {
  font-size: 22px;
  line-height: 1;
}

.text {
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
}

@media (max-width: 520px){
  @media (max-width: 520px) {
  .back-to-top {
    bottom: 80px;
    width: 50px;      
    height: 50px;     
    padding: 0;        
    border-radius: 50%; 
    justify-content: center;
  }

  .back-to-top .text {
    display: none; 
  }

  .back-to-top .arrow {
    font-size: 24px;
  }
}

}
</style>
