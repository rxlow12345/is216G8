// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import App from '../src/App.vue'; // Default app
import StatusUpdate from '../pages/status-update/StatusUpdate.vue'; // StatusUpdate

// 1. Define your routes as an array of objects
const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: StatusUpdate,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path:'/guidebook',
    name: 'GuideBook',
    component: GuideBook
  },
  {
    path: '/status-update',         // <-- THE URL FOR YOUR COMPONENT
    name: 'StatusUpdate',            // <-- A UNIQUE NAME
    component: StatusUpdate        // <-- THE COMPONENT VUE WILL RENDER
  },
  {
    path:'/guidebook',
    name: 'GuideBook',
    component: GuideBook
  }
];

// 2. Create the router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// 3. Authentication guard
let isAuthReady = false;
let currentUser = null;

// Listen to authentication state changes
onAuthStateChange(async (user) => {
  isAuthReady = true;
  
  if (user) {
    // User is logged in, fetch their role
    try {
      const { getCurrentUser } = await import('../src/api/auth.js');
      currentUser = await getCurrentUser();
    } catch (error) {
      console.error('Error fetching user data:', error);
      currentUser = null;
    }
  } else {
    currentUser = null;
  }
  
  // Handle navigation based on auth state
  handleAuthNavigation();
});

/**
 * Handle navigation based on authentication state and user role
 */
function handleAuthNavigation() {
  if (!isAuthReady) return;
  
  const currentRoute = router.currentRoute.value;
  const requiresAuth = currentRoute.meta.requiresAuth;
  const allowedRoles = currentRoute.meta.roles;
  
  // If route requires auth but user is not logged in
  if (requiresAuth && !currentUser) {
    router.push('/login');
    return;
  }
  
  // If user is logged in but doesn't have required role
  if (currentUser && allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect based on user role
    switch (currentUser.role) {
      case 'admin':
        router.push('/status-update');
        break;
      case 'reporter':
        router.push('/report');
        break;
      case 'volunteer':
        router.push('/volunteer/home');
        break;
      default:
        router.push('/login');
    }
    return;
  }
  
  // If user is logged in and trying to access login/signup or root, redirect to their dashboard
  if (currentUser && (currentRoute.path === '/' || currentRoute.path === '/login' || currentRoute.path === '/signup')) {
    switch (currentUser.role) {
      case 'admin':
        router.push('/status-update');
        break;
      case 'reporter':
        router.push('/report');
        break;
      case 'volunteer':
        router.push('/volunteer/home');
        break;
    }
  }
}

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Wait for auth to be ready
  if (!isAuthReady) {
    // Wait a bit and try again
    setTimeout(() => {
      router.push(to.path);
    }, 100);
    return;
  }
  
  const requiresAuth = to.meta.requiresAuth;
  const allowedRoles = to.meta.roles;
  
  // If route doesn't require auth, allow access
  if (!requiresAuth) {
    // If user is logged in and trying to access root/login/signup, redirect to their dashboard
    if (currentUser && (to.path === '/' || to.path === '/login' || to.path === '/signup')) {
      switch (currentUser.role) {
        case 'admin':
          next('/status-update');
          break;
        case 'reporter':
          next('/report');
          break;
        case 'volunteer':
          next('/volunteer/home');
          break;
        default:
          next();
      }
      return;
    }
    next();
    return;
  }
  
  // If user is not logged in, redirect to login
  if (!currentUser) {
    next('/login');
    return;
  }
  
  // If user doesn't have required role, redirect to their dashboard
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    switch (currentUser.role) {
      case 'admin':
        next('/status-update');
        break;
      case 'reporter':
        next('/report');
        break;
      case 'volunteer':
        next('/volunteer/home');
        break;
      default:
        next('/login');
    }
    return;
  }
  
  // Allow access
  next();
});

// 4. Export the router instance
export default router;