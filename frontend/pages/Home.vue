<!-- frontend/src/pages/Home.vue -->
<template>
  <div class="home-wrapper">
    <!-- Moving Cursor Component -->
    <OtterCursor animal="🦦" :speed="0.08" />


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


    <!-- Hero Section with Carousel -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="logo-large">
          <span class="logo-icon">🦊</span>
          <span class="logo-icon">🌿</span>
        </div>
        <h1 class="hero-title">CritterConnect</h1>
        <p class="hero-subtitle">Join Us In Saving Singapore's Wildlife!</p>
       
        <!-- CTA Buttons - Only show if not logged in -->
        <div v-if="!isLoggedIn" class="hero-buttons">
          <router-link to="/login" class="btn btn-primary">
            🌲 Login
          </router-link>
          <router-link to="/signup" class="btn btn-secondary">
            🦊 Sign Up Now
          </router-link>
        </div>
      </div>


      <!-- Scroll Down Indicator -->
      <div class="scroll-indicator">
        <span>↓</span>
        <p>Scroll to learn more</p>
      </div>
    </section>


    <!-- ======================== About Section ======================== -->
    <section class="about-section">
      <div class="container">
        <div class="about-card">
          <div class="about-content">
            <div class="about-text">
              <h2 class="section-title">About CritterConnect</h2>
             
              <p class="about-description">
                Based in the heart of <strong>Singapore</strong>, CritterConnect is a community-driven initiative
                dedicated to helping our local wildlife thrive. Whether it's a wounded pigeon in your neighbourhood
                or a stray kitten by the park, we make it easy for anyone to <strong>report injured animals</strong>
                and connect them with rescue organisations.
              </p>


              <p class="about-description">
                Our <router-link to="/guidebook" class="guidebook-link">Guidebook</router-link> helps you identify and
                learn about common species in Singapore — from squirrels to hornbills — so we can all
                coexist with our city's amazing biodiversity.
              </p>


              <div class="about-actions">
                <a href="/pages/new_report/report.html" class="btn-report" target="_self">
                  📝 Report an Animal
                </a>
              </div>
            </div>


            <!-- Carousel inside About Image -->
            <div class="about-image">
              <div class="carousel-wrapper" @mouseenter="pauseCarousel" @mouseleave="resumeCarousel">
                <div class="carousel-container">
                  <div class="carousel-track">
                    <div
                      v-for="(slide, index) in carouselImages"
                      :key="index"
                      class="carousel-slide"
                      :class="{ active: index === currentSlide }"
                    >
                      <img :src="slide.src" :alt="slide.alt" class="carousel-img" />
                      <div class="image-overlay">
                        <span class="image-caption">{{ slide.emoji }} {{ slide.caption }}</span>
                      </div>
                    </div>
                  </div>


                  <!-- Navigation arrows -->
                  <button class="carousel-btn prev" @click="prevSlide">❮</button>
                  <button class="carousel-btn next" @click="nextSlide">❯</button>


                  <!-- Dots -->
                  <div class="carousel-dots">
                    <span
                      v-for="(slide, index) in carouselImages"
                      :key="'dot-' + index"
                      class="dot"
                      :class="{ active: index === currentSlide }"
                      @click="goToSlide(index)"
                    ></span>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </section>


    <!-- ======================== Guidebook CTA Banner ======================== -->
    <section class="guidebook-cta-section">
      <div class="container">
        <div class="guidebook-banner">
          <div class="banner-animals">
            <span>🦔</span>
            <span>🦅</span>
            <span>🐿️</span>
            <span>🦉</span>
            <span>🦜</span>
          </div>
         
          <h2 class="banner-title">📚 Explore Our Wildlife Guidebook!</h2>
          <p class="banner-text">
            Discover and learn about Singapore's amazing biodiversity.
            <strong>No login required!</strong>
          </p>
         
          <router-link to="/guidebook" class="btn btn-guidebook-large">
            🔍 Browse Guidebook Now
          </router-link>
         
          <p class="banner-note">
            Learn to identify common species • Conservation tips • Fun facts
          </p>
        </div>
      </div>
    </section>


    <!-- ======================== Features Section ======================== -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title text-center">Make a Difference with CritterConnect</h2>
        <p class="section-subtitle text-center">Report, learn, and receive live rescue updates about our critters</p>
       
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🦔</div>
            <h3>Report Wildlife</h3>
            <p>Spotted an injured animal? Report it instantly and connect with rescue organizations</p>
          </div>
         
          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h3>Learn & Identify</h3>
            <p>Access our comprehensive guidebook to identify local species and learn about them</p>
          </div>
         
          <div class="feature-card">
            <div class="feature-icon">📬</div>
            <h3>Track Rescues</h3>
            <p>Receive live updates of the critter you have rescued and celebrate their recovery journey</p>
          </div>
        </div>
      </div>
    </section>


    <!-- ======================== Final CTA Section ======================== -->
    <section class="final-cta-section">
      <div class="container">
        <div class="final-cta-card">
          <h2>Want to Make a Difference?</h2>
          <p>Donate to CritterConnect's Partners Today!</p>
         
          <div class="cta-buttons">
            <router-link to="/donate" class="btn btn-donate">
              Donate
            </router-link>
          </div>


          <!-- ======================== Footer Critters ======================== -->
          <div class="footer-critters">
            <span class = "critter">🦔</span>
            <span class = "critter">🦅</span>
            <span class = "critter">🐿️</span>
            <span class = "critter">🦉</span>
            <span class = "critter">🦜</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getCurrentUser } from '../src/api/auth.js';
import '../pages/css/home.css'
import '../pages/css/common.css'
import OtterCursor from '../src/components/OtterCursor.vue';


// ======================== Floating Animals Array ========================
const floatingAnimals = ['🦊', '🦝', '🐿️', '🦔', '🦉', '🦌', '🐰', '🦫', '🐻', '🦅', '🐺', '🦜'];

// ======================== Auth State ========================
const auth = ref(null);
const isLoggedIn = computed(() => {
  return auth.value && auth.value.uid;
});

// ======================== Carousel Images ========================
const carouselImages = [
  { src: '/src/public/assets/otter.jpg', alt: 'Otter', caption: "Otters", emoji: '🦦' },
  { src: '/src/public/assets/cat.jpg', alt: 'Cat', caption: 'Felines', emoji: '🐱' },
  { src: '/src/public/assets/squirrel.jpg', alt: 'Squirrel', caption: 'Squirrels', emoji: '🐿️' },
  { src: '/src/public/assets/pigeon.jpg', alt: 'Pigeon', caption: 'Pigeons', emoji: '🕊️' },
  { src: '/src/public/assets/chicken.jpg', alt: 'Chicken', caption: 'Chickens', emoji: '🐔' }
];


const currentSlide = ref(0);
const isTransitioning = ref(false);
let autoRotateInterval = null;


// ======================== Get random style for floating animals ========================
function getAnimalStyle(index) {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${15 + Math.random() * 10}s`
  };
}


// ======================== Carousel Controls ========================
function nextSlide() {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentSlide.value = (currentSlide.value + 1) % carouselImages.length;
  setTimeout(() => { isTransitioning.value = false; }, 500);
}


function prevSlide() {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentSlide.value = currentSlide.value === 0 ? carouselImages.length - 1 : currentSlide.value - 1;
  setTimeout(() => { isTransitioning.value = false; }, 500);
}


function goToSlide(index) {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentSlide.value = index;
  setTimeout(() => { isTransitioning.value = false; }, 500);
}


// ======================== Auto-rotate ========================
function startAutoRotate() {
  autoRotateInterval = setInterval(() => {
    nextSlide();
  }, 4000);
}


function pauseCarousel() {
  clearInterval(autoRotateInterval);
}


function resumeCarousel() {
  startAutoRotate();
}


onMounted(async () => {
  startAutoRotate();
  // Fetch auth state
  try {
    auth.value = await getCurrentUser();
  } catch (error) {
    console.error('Error fetching auth:', error);
    auth.value = null;
  }
});


onUnmounted(() => {
  clearInterval(autoRotateInterval);
});
</script>
