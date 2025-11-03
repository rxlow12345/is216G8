<!-- frontend/src/pages/volunteer/Home.vue -->
<template>
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
        <h5 class="alertHeading">Welcome, Volunteer</h5>
        <p>Use the options below to navigate to volunteer tools.</p>
      </div>
    </div>

    <div class="buttonSections">
      <div class="buttonItem buttonItemLeft">
        <img src="../../src/public/assets/eagle.jpg" alt="Map" class="sectionImg">
        <div class="content">
          <router-link to="/map" class="btn greenBtnLg">Open Map</router-link>
          <p class="buttonDescription">View live reports on the operations map</p>
        </div>
      </div>

      <div class="buttonItem buttonItemRight">
        <img src="../../src/public/assets/squirrel2.jpg" alt="Active" class="sectionImg">
        <div class="content">
          <router-link to="/volunteer/active" class="btn brownBtn">Active Reports</router-link>
          <p class="buttonDescription">See reports you are currently handling</p>
        </div>
      </div>

      <div class="buttonItem buttonItemLeft">
        <img src="../../src/public/assets/turtle.jpg" alt="Past" class="sectionImg">
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
});
</script>

<style scoped>
.welcomeMessage {
  text-align: center;
  padding: 10px 0;
  margin: 40px 10px 20px 10px;
}

.alertCustom {
  background-color: #FEFAE0;
  border: none;
  color: #285436;
  box-shadow: none;
}

.alertHeading {
  font-size: 23px;
  font-weight: 600;
  color: #285436;
  margin-bottom: 5px;
}

.welcomeMessage p {
  font-size: 16px;
  color: #333;
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
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  opacity: 1; /* ensure visible by default */
  transform: none;
  transition: opacity 1s ease, transform 1s ease;
}

.buttonItemLeft { flex-direction: row; }
.buttonItemRight { flex-direction: row-reverse; }

.buttonItemLeft img { margin: 15px 0px 15px 15px; }
.buttonItemRight img { margin: 15px 15px 15px 0px; }

.buttonItemLeft .sectionImg,
.buttonItemRight .sectionImg {
  width: 48%;
  height: auto;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.buttonItemLeft .sectionImg:hover,
.buttonItemRight .sectionImg:hover { transform: scale(1.1); }

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
  transition: background-color 0.3s ease, color 0.3s ease;
}

.buttonDescription {
  margin-top: 10px;
  margin-bottom: 0px;
  padding-bottom: 0px;
  font-size: 15px;
  color: #333;
}

.greenBtnLg {
  background-color: #285436;
  color: rgb(254, 250, 224);
  border: 1px solid #285436;
}
.greenBtnLg:hover { background-color: #606C38; }

.brownBtn { background-color: #BC6C25; color: rgb(254, 250, 224); }
.brownBtn:hover { background-color: #DDA15E; }

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
</style>
