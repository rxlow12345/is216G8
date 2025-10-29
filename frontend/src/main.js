import { createApp } from 'vue';
import App from './App.vue';
import router from '../router/index.js'; // <-- FULL FIREBASE ROUTER

// Import Bootstrap's JS file
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app = createApp(App);

app.use(router); // <-- TELL VUE TO USE THE ROUTER

app.mount('#app');