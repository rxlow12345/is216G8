<template>
  <div class="container-fluid p-0 reporterDashboard">
    <!-- Top Banner -->
    <div id="topBanner" class="bannerTitles">
      <header class="text-center mb-2">
        <h1>Reporter Dashboard</h1>
      </header>
    </div>

    <!-- Welcome Message -->
    <div class="welcomeMessage">
      <div class="alertCustom">
        <h5 class="alertHeading">Welcome to your Dashboard</h5>
        <p>Use the options below to view past reports, create a new report, or track the status of existing reports.</p>
      </div>
    </div>

    <!-- Button Section with Images -->
    <div class="buttonSections">
      <div class="buttonItemLeft animateIn">
        <img src="../../src/public/assets/duck.jpg" alt="Duck" class="sectionImg">
        <div class="content">
          <a href="/new_report/report.html" class="btn brownBtn">Create New Report</a>
          <p class="buttonDescription">Report a new wildlife incident</p>
        </div>
      </div>

      <div class="buttonItemRight animateIn">
        <img src="../../src/public/assets/monkey.jpg" alt="Monkey" class="sectionImg">
        <div class="content">
          <a :href="'/status/' + userId" class="btn greenBtnLg">Check Report Status</a>
          <p class="buttonDescription">Track the status of your existing reports</p>
        </div>
      </div>

      <div class="buttonItemLeft animateIn">
        <img src="../../src/public/assets/eagle.jpg" alt="Eagle" class="sectionImg">
        <div class="content">
          <a href="/past-reports" class="btn brownBtn">View Past Reports</a>
          <p class="buttonDescription">View reports you've submitted previously</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getCurrentUser } from '../../src/api/auth.js';
import '../css/common.css'

// Reactive data
const userEmail = ref('');
const userId = ref('');

// Get current user info on component mount
onMounted(async () => {
  try {
    const user = await getCurrentUser();
    if (user) {
      userEmail.value = user.username || user.email;
      userId.value = user.uid;
    }
  } catch (error) {
    console.error('Error getting user info:', error);
  }

  // IntersectionObserver for fade-in effect
  const elements = document.querySelectorAll('.animateIn');
  const options = {
    root: null,
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fadeIn');
        observer.unobserve(entry.target);
      }
    });
  }, options);

  elements.forEach(element => observer.observe(element));
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

.buttonSections img {
  border-radius: 10px;
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
  transition: transform 0.5s ease-in-out;
  opacity: 0;
  transform: translateY(30px);
}

.buttonItemLeft {
  flex-direction: row;
}

.buttonItemRight {
  flex-direction: row-reverse;
}

.buttonItemLeft img {
  margin: 15px 0px 15px 15px;
}

.buttonItemRight img {
  margin: 15px 15px 15px 0px;
}

.buttonItemLeft .sectionImg,
.buttonItemRight .sectionImg {
  width: 48%;
  height: auto;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.buttonItemLeft .sectionImg:hover,
.buttonItemRight .sectionImg:hover {
  transform: scale(1.1);
}

.content {
  width: 52%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 25px 0px;
}

/* Button Styling */
.buttonItem .btn {
  width: 100%;
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

/* Color scheme buttons */
.greenBtnLg {
  background-color: #285436;
  color: rgb(254, 250, 224);
  border: 1px solid #285436;
}

.greenBtnLg:hover {
  background-color: #606C38;
}

.brownBtn {
  background-color: #BC6C25;
  color: rgb(254, 250, 224);
}

.brownBtn:hover {
  background-color: #DDA15E;
}

/* Responsive Design */
@media (max-width: 768px) {
  .welcomeMessage {
    margin: 40px 10px 0px 10px;
  }

  .buttonSections {
    width: 100%;
    padding: 20px;
  }

  .buttonItemLeft,
  .buttonItemRight {
    flex-direction: column;
    align-items: center;
  }

  .buttonItemLeft img {
    margin: 15px;
  }

  .buttonItemRight img {
    margin: 15px;
  }

  .buttonItemLeft .sectionImg,
  .buttonItemRight .sectionImg {
    width: 95%;
    height: auto;
  }

  .buttonItemLeft .sectionImg:hover,
  .buttonItemRight .sectionImg:hover {
    transform: scale(1.05);
  }

  .buttonItem {
    width: 100%;
    padding: 20px;
  }

  .content {
    width: 100%;
  }

  .content a {
    width: 240px;
  }

  .content p {
    margin-bottom: 25px;
  }
}

@media (max-width: 520px) {
  .welcomeMessage {
    margin: 10px 10px 0px 10px;
  }

  .buttonItemLeft img {
    margin: 10px;
  }

  .buttonItemRight img {
    margin: 10px;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.fadeIn {
  opacity: 1 !important;
  transform: translateY(0) !important;
  animation: fadeIn 1s ease-out forwards;
}
</style>
