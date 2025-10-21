<script>
export default {
  name: 'App'
};
</script>

<template>
  <div id="app">
    <!-- Example router links -->
    <!-- <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/status-update">Go to Status Update</router-link>
      <a href="../pages/report.html">Report</a>
    </nav> -->
    
    <!-- This is the magic placeholder! -->
    <!-- Your HomeView, MyNewView, etc., will be rendered right here -->
    <router-view></router-view>
  </div>
</template>

<style>
/* Add some simple styling for the active link */
.router-link-exact-active {
  color: #42b983;
  font-weight: bold;
}
</style>