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
      <router-view></router-view>
     </main>
    
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
export default {
  name: 'App',
  components: { NavBar }
}
</script>

<style>
main {
  padding-top: 90px !important; /* Match navbar height */
}
</style>