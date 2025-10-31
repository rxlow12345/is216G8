<template>
  <div id="cursorAnimal" :style="{ fontSize: size }">{{ animal }}</div>
</template>

<script>
export default {
  name: 'CursorAnimal',
  props: {
    animal: {
      type: String,
      default: '🦦'
    },
    speed: {
      type: Number,
      default: 0.08
    },
    size: {
      type: String,
      default: '35px'
    }
  },
  data() {
    return {
      mouseX: 0,
      mouseY: 0,
      animalX: 0,
      animalY: 0,
      animationFrameId: null
    }
  },
  methods: {
    handleMouseMove(e) {
      this.mouseX = e.clientX
      this.mouseY = e.clientY
    },

    animateCursor() {
      const animal = document.getElementById('cursorAnimal')
      if (!animal) return

      const dx = this.mouseX - this.animalX
      const dy = this.mouseY - this.animalY
      
      this.animalX += dx * this.speed
      this.animalY += dy * this.speed
      
      animal.style.left = (this.animalX - 20) + 'px'
      animal.style.top = (this.animalY - 20) + 'px'
      
      // Flip based on direction
      if (dx < -5) {
        animal.classList.add('flipped')
      } else if (dx > 5) {
        animal.classList.remove('flipped')
      }
      
      this.animationFrameId = requestAnimationFrame(this.animateCursor)
    },

    initCursorAnimation() {
      this.mouseX = window.innerWidth / 2
      this.mouseY = window.innerHeight / 2
      this.animalX = this.mouseX
      this.animalY = this.mouseY

      document.addEventListener('mousemove', this.handleMouseMove)
      this.animateCursor()
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.initCursorAnimation()
    })
  },

  beforeUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove)
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
  }
}
</script>

<style scoped>
#cursorAnimal {
  position: fixed;
  pointer-events: none;
  z-index: 999;
  transition: transform 0.1s ease;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
  will-change: transform;
}

#cursorAnimal.flipped {
  transform: scaleX(-1);
}

@media (max-width: 520px) {
  #cursorAnimal {
    font-size: 28px !important;
  }
}
</style>