<template>
  <div id="app">
    <!-- Example router links -->
    <!-- <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/status-update">Go to Status Update</router-link>
      <a href="../pages/report.html">Report</a>
    </nav> -->

    <header>
      <NavBar></NavBar>
    </header>

    <!-- This is the magic placeholder! -->
    <!-- Your HomeView, MyNewView, etc., will be rendered right here -->
    <main>
      <div :style="{ paddingTop: navbarHeight + 'px' }" class="page-content">
        <router-view />
      </div>
    </main>

  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
export default {
  name: 'App',
  components: { NavBar },
  data() {
    return {
      navbarHeight: 0,
    }
  },
  mounted() {
    this.updateNavbarHeight();
    window.addEventListener('resize', this.updateNavbarHeight);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateNavbarHeight);
  },
  methods: {
    updateNavbarHeight() {
      const navbar = document.querySelector('.customNavbar');
      if (navbar) {
        this.navbarHeight = navbar.offsetHeight;
      }
    }
  }
}
</script>

<style>
.page-content {
  transition: padding-top 0.2s; /* smooth adjustment when resizing */
}
</style>