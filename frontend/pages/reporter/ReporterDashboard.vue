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
      <div class="buttonItemLeft">
        <img src="../../src/public/assets/duck.jpg" alt="Duck" class="sectionImg">
        <div class="content">
          <a href="/new_report/report.html" class="btn linearBtn">Create New Report</a>
          <p class="buttonDescription">Report a new wildlife incident</p>
        </div>
      </div>

      <div class="buttonItemRight">
        <img src="../../src/public/assets/monkey.jpg" alt="Monkey" class="sectionImg">
        <div class="content">
          <a :href="'/status/' + userId" class="btn brownBtn">Check Report Status</a>
          <p class="buttonDescription">Track the status of your existing reports</p>
        </div>
      </div>

      <div class="buttonItemLeft">
        <img src="../../src/public/assets/eagle.jpg" alt="Eagle" class="sectionImg">
        <div class="content">
          <a href="/past-reports" class="btn greenBtnLg">View Past Reports</a>
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
      userId.value = user.uid; // Assuming user.uid is the Firebase user ID
    }
  } catch (error) {
    console.error('Error getting user info:', error);
  }
});
</script>

<style scoped>
.welcomeMessage {
  text-align: center;
  padding: 10px 0;
  margin-top: 30px;
  margin-bottom: 10px;
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

.buttonSections {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  min-height: 60vh;
  margin-bottom: 30px;
}

.buttonSections img {
  border-radius: 10px;
}

/* Alternate Image Section Styling */
.buttonItemLeft,
.buttonItemRight {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 800px;
  background-color: #FEFAE0;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

/* Position the images */
.buttonItemLeft .sectionImg,
.buttonItemRight .sectionImg {
  width: 45%;
  height: auto;
  object-fit: cover;
}

.content {
  width: 55%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

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
  font-size: 14px;
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

.linearBtn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
}

.linearBtn:hover {
  background: linear-gradient(135deg, #10b981 30%, #059669 70%);
}

.brownBtn {
  background-color: #BC6C25;
  color: rgb(254, 250, 224);
}

.brownBtn:hover {
  background-color: #DDA15E;
}

@media (max-width: 768px) {
  .buttonSections {
    width: 100%;
    padding: 20px;
  }

  .buttonItemLeft,
  .buttonItemRight {
    flex-direction: column;
    align-items: center;
  }

  .buttonItemLeft .sectionImg,
  .buttonItemRight .sectionImg {
    width: 80%;
    height: auto;
  }

  .alertCustom {
    width: 90%;
  }

  .buttonItem {
    width: 100%;
    padding: 20px;
  }
}
</style>
