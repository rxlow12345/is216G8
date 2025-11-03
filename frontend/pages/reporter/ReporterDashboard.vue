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
        <p>Use the options below to create a new report, track the status of existing reports, or view past reports.</p>
      </div>
    </div>

    <!-- Button Section with Images -->
    <div class="buttonSections">
      <div
        v-for="(item, index) in buttonItems"
        :key="index"
        :class="['buttonItem', item.align === 'left' ? 'buttonItemLeft' : 'buttonItemRight']"
        ref="sectionElements"
      >
        <img :src="item.imgSrc" :alt="item.imgAlt" class="sectionImg">
        <div class="content">
          <a :href="item.link" class="btn" :class="item.buttonClass">{{ item.buttonText }}</a>
          <p class="buttonDescription">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getCurrentUser } from '../../src/api/auth.js';
import '../css/common.css'

const userEmail = ref('');
const userId = ref('');

const buttonItems = ref([
  {
    imgSrc: '../../src/public/assets/duck.jpg',
    imgAlt: 'Duck',
    buttonText: 'Create New Report',
    buttonClass: 'brownBtn',
    description: 'Report a new wildlife incident',
    link: '/new-report',
    align: 'left'
  },
  {
    imgSrc: '../../src/public/assets/monkey.jpg',
    imgAlt: 'Monkey',
    buttonText: 'View All Reports',
    buttonClass: 'greenBtnLg',
    description: 'View reports you\'ve submitted previously',
    link: '/all-reports',
    align: 'right'
  }
]);

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

  const sectionElements = document.querySelectorAll('.buttonItem');

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

  sectionElements.forEach(element => observer.observe(element));
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
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1s ease, transform 1s ease;
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

/* Fade-in effect */
.fadeIn {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
</style>