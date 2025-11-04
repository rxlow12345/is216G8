<template>
  <!-- Navigation Bar -->
  <nav class="navbar navbar-expand-lg fixed-top customNavbar py-1">
    <div class="container-fluid">
      <!-- Logo + title -->
      <div class="d-flex align-items-center order-0">
        <router-link class="navbar-brand navbarLogo" to="/">
          <!-- prefer imported asset; keeps correct path in Vite -->
          <img :src="logoUrl" alt="Logo" class="d-inline-block align-text-top" style="height: 75px;">
        </router-link>
        <p class="critterTitle mb-0">CritterConnect</p>
      </div>

      <!-- Welcome Message -->
      <span v-if="auth.uid" class="welcome-bar order-1 px-3">
        Welcome back, {{ displayName }} 👋
      </span>

      <!-- Toggler (no data-API; click is programmatic) -->
      <button
        ref="navbarToggler"
        class="navbar-toggler navbarToggle order-2"
        type="button"
        aria-controls="navbarNav"
        :aria-expanded="false"
        aria-label="Toggle navigation"
        @click="onTogglerClick"
      >
        <img id="navbarToggleBurger" :src="iconSrc" alt="menu">
      </button>

      <!-- Collapsible nav -->
      <div
        ref="navbarCollapse"
        class="collapse navbar-collapse justify-content-end order-2"
        id="navbarNav"
      >
        <ul class="navbar-nav navbarNav text-center">
          <!-- Always visible links -->
          <li class="nav-item">
            <router-link class="nav-link navLink" to="/" exact-active-class="active" @click="collapseNavbar">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link navLink" to="/guidebook" exact-active-class="active" @click="collapseNavbar">Guidebook</router-link>
          </li>

          <!-- Map only for admin/volunteer -->
          <li v-if="auth.role === 'admin' || auth.role === 'volunteer'" class="nav-item">
            <router-link class="nav-link navLink" to="/map" exact-active-class="active" @click="collapseNavbar">Map</router-link>
          </li>

          <li class="nav-item">
            <router-link class="nav-link navLink" to="/donate" exact-active-class="active" @click="collapseNavbar">Donate</router-link>
          </li>

          <!-- Only if not logged in -->
          <li v-if="!auth.uid" class="nav-item">
            <router-link class="nav-link navLink" to="/login" exact-active-class="active" @click="collapseNavbar">Login</router-link>
          </li>

          <!-- Role dashboards -->
          <li v-if="auth.role === 'volunteer'" class="nav-item">
            <router-link class="nav-link navLink" to="/volunteer/home" exact-active-class="active" @click="collapseNavbar">Dashboard</router-link>
          </li>
          <li v-if="auth.role === 'reporter'" class="nav-item">
            <router-link class="nav-link navLink" to="/report" exact-active-class="active" @click="collapseNavbar">Dashboard</router-link>
          </li>
          <li v-if="auth.role === 'admin'" class="nav-item">
            <router-link class="nav-link navLink" to="/admin" exact-active-class="active" @click="collapseNavbar">Admin</router-link>
          </li>

          <!-- Logout -->
          <li v-if="auth.uid" class="nav-item">
            <a class="nav-link navLink" href="#" @click.prevent="handleLogoutAndCollapse" exact-active-class="active">Logout</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
// auth helpers (as in your project)
import { getCurrentUser, logout, onAuthStateChange } from '../api/auth.js';

// Use bundle (includes Popper + plugins). TS doesn’t have types for this import.
// @ts-ignore
import { Collapse } from 'bootstrap/dist/js/bootstrap.bundle.min.js';

// import assets so Vite resolves paths correctly
import logoPng from '../public/assets/logo.png';
import burgerIcon from '../public/assets/navBurger.svg';
import closeIcon from '../public/assets/navClose.svg';

export default {
  name: 'Navbar',
  data() {
    return {
      auth: { email: null, role: null, uid: null, username: null },
      collapseInstance: null,
      iconSrc: burgerIcon,   // reactive icon
      logoUrl: logoPng
    };
  },
  computed: {
    displayName() {
      if (this.auth.username){
        return this.auth.username;
      }
  }
},
  methods: {
    // programmatic toggle entrypoint
    onTogglerClick() {
      const el = this.$refs.navbarCollapse;
      if (!el) return;

      if (!this.collapseInstance) {
        this.collapseInstance = Collapse.getOrCreateInstance(el, { toggle: false });
        this.bindCollapseEvents(); // only once when first used
      }
      this.collapseInstance.toggle();
    },

    bindCollapseEvents() {
      const el = this.$refs.navbarCollapse;
      const toggler = this.$refs.navbarToggler;
      const img = document.getElementById('navbarToggleBurger');
      if (!el || !toggler || !img) return;

      // Opening
      el.addEventListener('show.bs.collapse', () => {
        toggler.setAttribute('aria-expanded', 'true');
        img.classList.remove('navFadeIn');
        img.classList.add('navFadeOut');
      });

      // Opened
      el.addEventListener('shown.bs.collapse', () => {
        setTimeout(() => {
          this.iconSrc = closeIcon;
          img.classList.remove('navFadeOut');
          img.classList.add('navFadeIn');
        }, 120);
      });

      // Closing
      el.addEventListener('hide.bs.collapse', () => {
        toggler.setAttribute('aria-expanded', 'false');
        img.classList.remove('navFadeIn');
        img.classList.add('navFadeOut');
      });

      // Closed
      el.addEventListener('hidden.bs.collapse', () => {
        setTimeout(() => {
          this.iconSrc = burgerIcon;
          img.classList.remove('navFadeOut');
          img.classList.add('navFadeIn');
        }, 120);
      });
    },

    // collapse when clicking any nav link / after logout
    collapseNavbar() {
      const el = this.$refs.navbarCollapse;
      if (this.collapseInstance && el && el.classList.contains('show')) {
        this.collapseInstance.hide();
      }
    },

    handleLogout() {
      try {
        logout();
        this.auth = { email: null, role: null, uid: null, username: null };
        this.$router.push('/'); // redirect home
      } catch (err) {
        console.error(err);
      }
    },

    handleLogoutAndCollapse() {
      this.handleLogout();
      this.collapseNavbar();
    },

    async fetchCurrentUser() {
      try {
        const auth = await getCurrentUser();
        this.auth = auth || { email: null, role: null, uid: null, username: null };
      } catch (err) {
        console.error(err);
      }
    }
  },

  // initial auth + live auth updates
  created() {
    this.fetchCurrentUser();

    // stay reactive to auth changes (login/logout/role change)
    onAuthStateChange(async (user) => {
      if (user) {
        try {
          const auth = await getCurrentUser();
          this.auth = auth || { email: null, role: null, uid: null, username: null };
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        this.auth = { email: null, role: null, uid: null, username: null };
      }
    });
  },

  mounted() {
    // nothing else to do; first click will set up collapse + listeners
  },

  beforeUnmount() {
    if (this.collapseInstance) {
      this.collapseInstance.dispose();
      this.collapseInstance = null;
    }
  }
};
</script>

<style>
.navbar-brand { margin-right: 8px; }

.critterTitle {
  display: inline-block;
  font-size: 20px;
  font-weight: 700;
  color: #285436;
}

.welcome-bar {
  color: #285436;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}

/* icon fade/scale */
#navbarToggleBurger {
  transition: opacity 0.15s ease-in-out, transform 0.15s ease-in-out;
}
.navFadeOut { opacity: 0 !important; transform: scale(0.8) !important; }
.navFadeIn { opacity: 1 !important; transform: scale(1) !important; }

/* optional: center items on mobile menu */
@media (max-width: 767.98px) {
  .navbarNav .nav-link { font-size: 1.25rem; padding: 0.5rem 0; }
}
</style>
