// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { onAuthStateChange } from '../src/api/auth.js';
import App from '../src/App.vue'; // Default app
import StatusUpdate from '../pages/orgAdmin/StatusUpdate.vue'; // StatusUpdate
import Home from '../pages/Home.vue'
import Donate from '../src/components/Donate.vue';
import Login from '../pages/auth/Login.vue';
import Signup from '../pages/auth/Signup.vue';
import ReporterDashboard from '../pages/reporter/ReporterDashboard.vue';
import VolunteerDashboard from '../pages/volunteer/VolunteerDashboard.vue';
import Game from '../pages/guidebook/guidebook game/game.vue';
import GuideBook from '../pages/GuideBook.vue';
import Map from '../pages/map/Map.vue';
import Status from '../pages/reporter/Status.vue';
import PastReports from '../pages/past_reports/PastReports.vue';

// 1. Define your routes as an array of objects
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
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
    path: '/map',
    name: 'Map',
    component: Map,
    meta: { requiresAuth: false, roles: ['admin'] }
  },
  {
    path:'/guidebook',
    name: 'GuideBook',
    component: GuideBook,
    meta: { requiresAuth: false }
  },
  {
    path: '/status-update',         // <-- THE URL FOR YOUR COMPONENT
    name: 'StatusUpdate',            // <-- A UNIQUE NAME
    component: StatusUpdate        // <-- THE COMPONENT VUE WILL RENDER
  },
  {
    path: '/status/:id',
    name: 'Status',       
    component: Status      
  },
  {
    path:'/guidebook/game',
    name: 'GuideBook Game',
    component: Game,
    meta: { requiresAuth: false }
  },
  {
    path:'/report',
    name: 'Reporter Dashboard',
    component: ReporterDashboard,
  },
  {
    path:'/volunteer/home',
    name: 'Volunteer Dashboard',
    component: VolunteerDashboard,
  },
  {
    path: '/donate',
    name: 'Donate',
    component: Donate,
    meta: { requiresAuth: false }
  },
  {
    path: '/past-reports',
    name: 'Past Reports',
    component: PastReports
  }
];

// 2. Create the router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition){
    return {
      top:0,
      behavior: 'smooth'
    };
  }
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
