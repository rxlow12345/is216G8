<!-- frontend/src/pages/volunteer/Home.vue -->
<template>
  <OtterCursor animal="🦦" :speed="0.08"/>
  <BackToTop/>
  <FloatingBackground/>
  <div class="container-fluid p-0 reporterDashboard">
    <div id="topBanner" class="bannerTitles">
      <header class="text-center mb-2">
        <h1>Volunteer Dashboard</h1>
      </header>
    </div>

    <div class="welcomeMessage">
      <div class="alertCustom">
        <h5 class="alertHeading">Welcome To Your Dashboard </h5>
        <p> Use the options below to navigate to volunteer tools. ⬇️</p>
      </div>
    </div>

    <div class="buttonSections">
      <div class="buttonItem buttonItemLeft">
        <img :src="getAssetUrl('eagle.jpg')" alt="Map" class="sectionImg">
        <div class="content">
          <router-link to="/map" class="btn greenBtnLg">Open Map</router-link>
          <p class="buttonDescription">View live reports on the operations map</p>
        </div>
      </div>

      <div class="buttonItem buttonItemRight">
        <img :src="getAssetUrl('squirrel2.jpg')" alt="Active" class="sectionImg">
        <div class="content">
          <router-link to="/volunteer/active" class="btn brownBtn">Active Reports</router-link>
          <p class="buttonDescription">See reports you are currently handling</p>
        </div>
      </div>

      <div class="buttonItem buttonItemLeft">
        <img :src="getAssetUrl('turtle.jpg')" alt="Past" class="sectionImg">
        <div class="content">
          <router-link to="/volunteer/past" class="btn greenBtnLg">Past Reports</router-link>
          <p class="buttonDescription">Browse completed reports</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { logout, checkUserAuthAndRole } from '../../src/api/auth.js';
import BackToTop from '../../src/components/BackToTop.vue';
import FloatingBackground from '../../src/components/FloatingBackground.vue';
import OtterCursor from '../../src/components/OtterCursor.vue';
import { getAssetUrl } from '../../src/utils/getAssetUrl.js';
import '../css/common.css'

// Reactive data
const userEmail = ref('');
const currentUser = ref(null);

// Router instance
const router = useRouter();

/**
 * Check user authentication and role on component mount
 */
onMounted(async () => {
  // Use the utility function for cleaner code
  await checkUserAuthAndRole(router, 'volunteer', { userEmail, currentUser });
  setupScrollAnimations();
});

const setupScrollAnimations = () => {
  const sections = document.querySelectorAll('.buttonItem');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fadeIn');
        observer.unobserve(entry.target); // Stop observing once animated
      }
    });
  }, {
    threshold: 0.2, // Trigger when 20% of the element is visible
    rootMargin: '0px 0px -50px 0px' // Start slightly before it comes into view
  });
  
  sections.forEach((section) => {
    observer.observe(section);
  });
};
</script>

<style scoped>
.welcomeMessage {
  text-align: center;
  padding: 10px 0;
  margin: 40px 10px 20px 10px;
}

.alertCustom {
  background: linear-gradient(135deg, #eebf9b 0%, #b5dab7 100%);
  border-radius: 15px;
  padding: 25px;
  max-width: 950px;
  margin: 0 auto;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.alertCustom:hover {
  transform: translateY(-5px);
}

.alertHeading {
  font-size: 30px;
  font-weight: 400;
  color: #285436;
}

.welcomeMessage p {
  font-size: 18px;
  color: #3A4D37;
  margin-top: 10px;
}

/* Button Sections */
.buttonSections {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: center;
  min-height: 60vh;
  margin-bottom: 60px;
}

.buttonItemLeft,
.buttonItemRight {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 950px;
  /* background-color: white; */
  background: linear-gradient(120deg, #ffffff, #fafdf9);
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  opacity: 1; /* ensure visible by default */
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.buttonItemRight {
  transform: translateX(100px);
}

.buttonItemLeft::before,
.buttonItemRight::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(40, 84, 54, 0.1), transparent);
  transition: left 0.6s ease;
}

.buttonItemLeft:hover,
.buttonItemRight:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(40, 84, 54, 0.2);
}

.buttonItemLeft:hover::before,
.buttonItemRight:hover::before {
  left: 100%;
}

.buttonItemLeft { flex-direction: row; }
.buttonItemRight { flex-direction: row-reverse; }

.buttonItemLeft img { margin: 15px 0px 15px 15px; border-radius: 10px; }
.buttonItemRight img { margin: 15px 15px 15px 0px;  border-radius: 10px;}

.buttonItemLeft .sectionImg,
.buttonItemRight .sectionImg {
  width: 48%;
  height: auto;
  object-fit: cover;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  filter: brightness(0.95) saturate(1.1);
}

.buttonItemLeft .sectionImg:hover,
.buttonItemRight .sectionImg:hover { transform: scale(1.1) rotate(2deg); 
  filter: brightness(1.05) saturate(1.2);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
 }

.content {
  width: 52%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 25px 0px;
}

.buttonItem .btn {
  width: 240px;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  border-radius: 10px;
  display: inline-block;
  margin: 0 auto;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.buttonItem .btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
  z-index: -1;
}

.buttonItem .btn:hover::before {
  width: 300px;
  height: 300px;
}

.buttonItem .btn:active {
  transform: scale(0.95);
}

.buttonDescription {
  margin-top: 10px;
  margin-bottom: 0px;
  padding-bottom: 0px;
  font-size: 15px;
  color: #333;
  transition: all 0.3s ease;
}

.buttonItem:hover .buttonDescription {
  color: #285436;
  transform: translateY(-2px);
}

.greenBtnLg {
  background-color: #285436;
  color: rgb(254, 250, 224);
  border: 1px solid #285436;
  box-shadow: 0 0 0 rgba(184, 108, 46, 0);
  animation: pulseGlow 2s infinite;
}

.greenBtnLg:hover { 
  background-color: #606C38;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(40, 84, 54, 0.3);
}

.brownBtn { background-color: #BC6C25; color: rgb(254, 250, 224); animation: pulseGlow 2s infinite }
.brownBtn:hover { background-color: #DDA15E; transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(188, 108, 37, 0.3); }

/* Responsive */
@media (max-width: 768px) {
  .welcomeMessage { margin: 40px 10px 0px 10px; }
  .buttonSections { width: 100%; padding: 20px; }
  .buttonItemLeft, .buttonItemRight { flex-direction: column; align-items: center; }
  .buttonItemLeft img, .buttonItemRight img { margin: 15px; }
  .buttonItemLeft .sectionImg, .buttonItemRight .sectionImg { width: 95%; height: auto; }
  .buttonItemLeft .sectionImg:hover, .buttonItemRight .sectionImg:hover { transform: scale(1.05); }
  .buttonItem { width: 100%; padding: 20px; }
  .content { width: 100%; }
  .content p { margin-bottom: 25px; }
}

@media (max-width: 520px) {
  .welcomeMessage { margin: 10px 10px 0px 10px; }
  .buttonItemLeft img, .buttonItemRight img { margin: 10px; }
}

.fadeIn { opacity: 1 !important; transform: translateY(0) !important; }

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 0 rgba(184,108,46,0.0);
  }
  50% {
    box-shadow: 0 0 20px rgba(184,108,46,0.6);
  }
}

.buttonItem:hover {
  animation: none;
}
</style>
