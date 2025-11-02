<template>
  <!-- Navigation Bar -->
  <nav class="navbar navbar-expand-lg fixed-top customNavbar py-1">
    <div class="container-fluid">
      <!-- Logo -->
      <router-link class="navbar-brand navbarLogo order-0" to="/">
        <img src="../public/assets/NoWordLogo.png" alt="Logo" class="d-inline-block align-text-top" style="height: 75px;">
      </router-link>

      <img src="../public/assets/Title.png" style="height:60px;">

      <!-- Welcome Message -->
      <span v-if="auth.uid" class="navbar-text me-auto ms-3 order-1">
        Welcome, {{ displayName }}
      </span>

      <!-- Toggler -->
      <button class="navbar-toggler navbarToggle order-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <img id="navbarToggleBurger" src="../public/assets/navBurger.svg" alt="menu">
      </button>

      <!-- Nav links -->
      <div class="collapse navbar-collapse justify-content-end order-2" id="navbarNav">
        <ul class="navbar-nav navbarNav">
          <!-- Always visible links -->
          <li class="nav-item"><router-link class="nav-link navLink" to="/" exact-active-class="active" @click="collapseNavbar">Home</router-link></li>
          <li class="nav-item"><router-link class="nav-link navLink" to="/guidebook" exact-active-class="active" @click="collapseNavbar">Guidebook</router-link></li>
          <!-- Map only visible to admin and volunteer -->
          <li v-if="auth.role === 'admin' || auth.role === 'volunteer'" class="nav-item"><router-link class="nav-link navLink" to="/map" exact-active-class="active" @click="collapseNavbar">Map</router-link></li>
          <li class="nav-item"><router-link class="nav-link navLink" to="/donate" exact-active-class="active" @click="collapseNavbar">Donate</router-link></li>
        

          <!-- Only if not logged in -->
          <li v-if="!auth.uid" class="nav-item"><router-link class="nav-link navLink" to="/login" exact-active-class="active" @click="collapseNavbar">Login</router-link></li>

          <!-- Volunteer role -->
          <li v-if="auth.role === 'volunteer'" class="nav-item"><router-link class="nav-link navLink" to="/volunteer/home" exact-active-class="active" @click="collapseNavbar">Dashboard</router-link></li>
          <!-- Reporter role -->
          <li v-if="auth.role === 'reporter'" class="nav-item"><router-link class="nav-link navLink" to="/report" exact-active-class="active" @click="collapseNavbar">Dashboard</router-link></li>
          <!-- Admin role -->
          <li v-if="auth.role === 'admin'" class="nav-item"><router-link class="nav-link navLink" to="/admin" exact-active-class="active" @click="collapseNavbar">Admin</router-link></li>
          <!-- Logout -->
          <li v-if="auth.uid" class="nav-item"><a class="nav-link navLink" href="#" @click.prevent="handleLogoutAndCollapse" exact-active-class="active">Logout</a></li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { getCurrentUser, logout } from '../api/auth.js';
import { onAuthStateChange } from '../api/auth.js';
import { Collapse } from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import burgerIcon from '../public/assets/navBurger.svg';
import closeIcon from '../public/assets/navClose.svg';

export default {
  name: 'Navbar',
  data() {
    return {
      auth: { email: null, role: null , uid: null, username: null},
    }
  },
  computed: {
    displayName() {
      // Extract username from email or use username field
      let name = this.auth.username || this.auth.email || '';
      if (name.includes('@')) {
        return name.split('@')[0]; // Get only the part before @
      }
      return name;
    }
  },
  methods: {
    handleLogout() {
      try {
        logout();
        this.auth = { email: null, role: null , uid: null, username: null};
        this.$router.push('/'); // redirect home
      } catch (err) {
        console.error(err);
      }
    },
    async fetchCurrentUser() {
      try {
        const auth = await getCurrentUser();
        if(auth){
          this.auth = auth;
        }
        else{
          this.auth = { email: null, role: null , uid: null, username: null};
        }
      } catch (err) {
        console.error(err);
      }
    },
    collapseNavbar() {
      const navbar = document.querySelector('#navbarNav');
      const bsCollapse = Collapse.getInstance(navbar);
      if (bsCollapse && navbar.classList.contains('show')) {
        bsCollapse.hide();
      }
    },
    handleLogoutAndCollapse() {
      this.handleLogout();
      this.collapseNavbar();
    },
    initNavbarAnimation() {
      const navbarBurger = document.getElementById("navbarToggleBurger");
      const navbarClose = document.getElementById("navbarNav");

      if (!navbarBurger || !navbarClose) return;

      // Shown event
      navbarClose.addEventListener("shown.bs.collapse", () => {
        navbarBurger.classList.add("navFadeOut");
        setTimeout(() => {
          navbarBurger.src = closeIcon;
          navbarBurger.classList.remove("navFadeOut");
          navbarBurger.classList.add("navFadeIn");
        }, 100);
      });

      // Hidden event
      navbarClose.addEventListener("hidden.bs.collapse", () => {
        navbarBurger.classList.add("navFadeOut");
        setTimeout(() => {
          navbarBurger.src = burgerIcon;
          navbarBurger.classList.remove("navFadeOut");
          navbarBurger.classList.add("navFadeIn");
        }, 100);
      });
    }
  },
  created() {
    console.log('created: ', this.auth);
    this.fetchCurrentUser();
    // Listen to authentication state changes
    onAuthStateChange(async (user) => {
      if (user) {
        try {
          const auth = await getCurrentUser();
          if(auth){
            this.auth = auth;
          }
          else{
            this.auth = { email: null, role: null , uid: null, username: null};
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        // User signed out, clear auth data
        this.auth = { email: null, role: null, uid: null, username: null };
      }
    });
  },
  mounted() {
  // Initialize the navbar animation after DOM is ready
  this.initNavbarAnimation();
}
};
</script>
<style>
.navFadeOut {
  opacity: 0;
  transform: scale(0.8);
}

.navFadeIn {
  opacity: 1;
  transform: scale(1);
}
</style>
