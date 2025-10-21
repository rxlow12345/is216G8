import { createApp } from 'vue';
import App from './App.vue';
import router from '../router/index.js'; // <-- IMPORT YOUR ROUTER CONFIGURATION

const app = createApp(App);

app.use(router); // <-- TELL VUE TO USE THE ROUTER

app.mount('#app');