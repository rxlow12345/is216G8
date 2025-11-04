<template>
  <div id="app">
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
    const navbar = document.querySelector('.customNavbar');
    this.updateNavbarHeight();

    window.addEventListener('resize', this.updateNavbarHeight);
    if (navbar) {
      // navbar.addEventListener('shown.bs.collapse', this.updateNavbarHeight);
      navbar.addEventListener('hidden.bs.collapse', this.updateNavbarHeight);
    }
    // Remove all footer elements from the entire app
    //this.removeAllFooters();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateNavbarHeight);
  },
  methods: {
    updateNavbarHeight() {
      const navbar = document.querySelector('.customNavbar');
      if (!navbar) return;

      // Find only the immediate first row (brand + toggler)
      const bar = navbar.querySelector('.container-fluid');
      let height = 0;

      if (bar) {
        // Only this top section — ignore collapse content
        const rect = bar.getBoundingClientRect();
        height = rect.height;
      } else {
        // fallback to navbar height if query fails
        height = navbar.offsetHeight;
      }

      this.navbarHeight = height;
    }
  }
}
</script>

<style>
.page-content {
  transition: padding-top 0.1s;
}
</style>