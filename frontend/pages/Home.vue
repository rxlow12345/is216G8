<!-- frontend/src/pages/Home.vue -->
<template>
  <div class="home-wrapper">
    <!-- Moving Cursor Component -->
    <OtterCursor animal="🦦" :speed="0.08" />


    <!-- Floating Animals Background -->
    <FloatingBackground/>

    <!-- Back To Top Button -->
     <BackToTop/>

    <!-- Hero Section with Carousel -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="logo-large">
          <span class="logo-icon">🐾</span>
          <span class="logo-icon">🦊</span>
        </div>
        <h1 class="hero-title">CritterConnect</h1>
        <p class="hero-subtitle">Join Us In Saving Singapore's Wildlife!</p>
       
        <!-- CTA Buttons - Only show if not logged in -->
        <div v-if="!isLoggedIn" class="hero-buttons">
          <router-link to="/login" class="btn brown-btn">
            Login
          </router-link>
          <router-link to="/signup" class="btn green-btn-lg">
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
                  dedicated to helping our local critters thrive. 
                  <br><br>
                  Our <router-link to="/guidebook" class="description-link">Guidebook</router-link> helps you identify and
                  learn about common species in Singapore and you can even test your knowledge with our <strong>"Match the Card"</strong> game.
                  <br><br>
                  Spotted an injured critter? 
                  <router-link to='/login' class = "description-link">Submit a report</router-link> now and <strong>gain access to more features</strong> designed to help you stay connected and informed.
              </p>
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
         
          <h2 class="banner-title">📚 Explore Our Critter Guidebook!</h2>
          <p class="banner-text">
            Discover and play games to learn about Singapore's amazing biodiversity. <br>
            <strong>No login required!</strong>
          </p>
         
          <router-link to="/guidebook" class="btn linear-btn">
            🔍 Browse Guidebook Now
          </router-link>
         
          <p class="banner-note">
            Learn to identify common species • Conservation tips • Fun facts
          </p>
        </div>
      </div>
    </section>


    <!-- ======================== Features Section ======================== -->
    <!-- Only show feature cards if user is not volunteer or admin -->
    <section v-if="!shouldHideFeatureCards" class="features-section">
      <div class="container">
        <h2 class="section-title text-center">Make a Difference with CritterConnect</h2>
        <p class="feature-card-note">
  💡      Tap on a card to explore the page
        </p>
       
        <div class="features-grid">
        <router-link to="/login" class="feature-card-link">
          <div class="feature-card">
            <div class="feature-icon">🦔</div>
            <h3>Report Critters</h3>
            <p>Spotted an injured critter? Log in and report to get live updates from our rescue organisationss</p>
          </div>
        </router-link>
         
        <router-link to="/guidebook" class="feature-card-link">
          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h3>Learn & Identify</h3>
            <p>Access our comprehensive guidebook to identify local species and learn about them</p>
          </div>
        </router-link>
          
        <router-link to="/donate" class="feature-card-link">
          <div class="feature-card">
            <div class="feature-icon">🤝</div>
            <h3>Help Our Partners</h3>
            <p>Join us in empowering our partners to continue their vital work in rescuing and caring for our critters.</p>
          </div>
        </router-link>
      </div>
      </div>
    </section>


    <!--======================== Final CTA Section ========================
    <section class="final-cta-section">
      <div class="container">
        <div class="final-cta-card">
          <h2>Help Us Make a Difference!</h2>
          <p>Donate to CritterConnect's Partners Today</p>
         
          <div class="cta-buttons">
            <router-link to="/donate" class="btn btn-donate">
              Learn More About Our Partners
            </router-link>
          </div>


          
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
  -->
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getCurrentUser } from '../src/api/auth.js';
import '../pages/css/home.css'
import '../pages/css/common.css'
import OtterCursor from '../src/components/OtterCursor.vue';
import FloatingBackground from '../src/components/FloatingBackground.vue';
import BackToTop from '../src/components/BackToTop.vue';
import { getAssetUrl } from '../src/utils/getAssetUrl.js';


// ======================== Auth State ========================
const auth = ref(null);
const isLoggedIn = computed(() => {
  return auth.value && auth.value.uid;
});

// Hide feature cards if user is volunteer or admin
const shouldHideFeatureCards = computed(() => {
  return auth.value && (auth.value.role === 'volunteer' || auth.value.role === 'admin');
});

// ======================== Carousel Images ========================
const carouselImages = [
  { src: getAssetUrl('otter.jpg'), alt: 'Otter', caption: "Otters", emoji: '🦦' },
  { src: getAssetUrl('cat.jpg'), alt: 'Cat', caption: 'Felines', emoji: '🐱' },
  { src: getAssetUrl('squirrel.jpg'), alt: 'Squirrel', caption: 'Squirrels', emoji: '🐿️' },
  { src: getAssetUrl('pigeon.jpg'), alt: 'Pigeon', caption: 'Pigeons', emoji: '🕊️' },
  { src: getAssetUrl('chicken.jpg'), alt: 'Chicken', caption: 'Chickens', emoji: '🐔' }
];


const currentSlide = ref(0);
const isTransitioning = ref(false);
let autoRotateInterval = null;

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
