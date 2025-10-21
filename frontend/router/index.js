// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import App from '../src/App.vue'; // Default app
import StatusUpdate from '../pages/status-update/StatusUpdate.vue'; // StatusUpdate

// 1. Define your routes as an array of objects
const routes = [
  {
    path: '/',          // The URL path
    name: 'Home',       // Home
    component: StatusUpdate // Change to home later
  },
  {
    path: '/status-update',         // <-- THE URL FOR YOUR COMPONENT
    name: 'StatusUpdate',            // <-- A UNIQUE NAME
    component: StatusUpdate        // <-- THE COMPONENT VUE WILL RENDER
  }
];

// 2. Create the router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes // short for `routes: routes`
});

// 3. Export the router instance
export default router;