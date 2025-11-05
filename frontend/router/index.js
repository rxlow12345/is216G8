// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { onAuthStateChange, getCurrentUser } from '../src/api/auth.js';
import App from '../src/App.vue'; // Default app
import StatusUpdate from '../pages/orgAdmin/StatusUpdate.vue'; // StatusUpdate
import Home from '../pages/Home.vue'
import Donate from '../src/components/Donate.vue';
import Login from '../pages/auth/Login.vue';
import Signup from '../pages/auth/Signup.vue';
import ReporterDashboard from '../pages/reporter/ReporterDashboard.vue';
import VolunteerDashboard from '../pages/volunteer/VolunteerDashboard.vue';
import VolunteerActive from '../pages/volunteer/ActiveReports.vue';
import VolunteerPast from '../pages/volunteer/PastReports.vue';
import Game from '../pages/guidebook/guidebook game/game.vue';
import GuideBook from '../pages/GuideBook.vue';
import Map from '../pages/map/Map.vue';
import Status from '../pages/reporter/Status.vue';
import Common from '../pages/Common.vue';
import LearnMore from '../src/components/LearnMore.vue';
import AllReporterReports from '../pages/reporter/AllReporterReports.vue';
import NewReport from '../pages/new_report/NewReport.vue';

// 1. Define your routes as an array of objects
const routes = [
  { //DELETE BEFORE SUBMISSION****
    path: '/common',
    name: 'Common',
    component: Common
  },
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
    meta: { requiresAuth: true, roles: ['admin', 'volunteer'] }
  },
  {
    path:'/guidebook',
    name: 'GuideBook',
    component: GuideBook,
    meta: { requiresAuth: false }
  },
  {
    path: '/status/:id',
    name: 'Status',       
    component: Status,
    meta: { requiresAuth: true, roles: ['reporter', 'volunteer', 'admin'] }
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
    meta: { requiresAuth: true, roles: ['reporter'] }
  },
  {
    path:'/volunteer/home',
    name: 'Volunteer Dashboard',
    component: VolunteerDashboard,
    meta: { requiresAuth: true, roles: ['volunteer'] }
  },
  {
    path:'/volunteer/active',
    name: 'Volunteer Active Reports',
    component: VolunteerActive,
    meta: { requiresAuth: true, roles: ['volunteer'] }
  },
  {
    path:'/volunteer/past',
    name: 'Volunteer Past Reports',
    component: VolunteerPast,
    meta: { requiresAuth: true, roles: ['volunteer'] }
  },
  {
    path: '/donate',
    name: 'Donate',
    component: Donate,
    meta: { requiresAuth: false }
  },
  {
    path: '/learn-more',
    name: 'LearnMore',
    component: LearnMore,
    meta: { requiresAuth: false }
  },
  {
    path: '/all-reports',
    name: 'All Reporter Reports',
    component: AllReporterReports,
    meta: { requiresAuth: true, roles: ['reporter'] }
  },
  {
    path: '/new-report',
    name: 'New Report',
    component: NewReport,
    meta: { requiresAuth: true, roles: ['reporter'] }
  },
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
  
  // Mark auth as ready after first state change
  if (!isAuthReady) {
    isAuthReady = true;
    // If we're on a route that requires auth and user is not logged in, redirect will happen in beforeEach
    // If user is logged in and on login/signup, redirect will happen in beforeEach
    // Don't force navigation here - let beforeEach handle it
  }
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Wait for auth to be ready (with timeout to prevent infinite waiting)
  if (!isAuthReady) {
    // Wait for auth state to initialize
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    while (!isAuthReady && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    // If still not ready after max attempts, proceed anyway (auth might be taking longer)
    if (!isAuthReady) {
      console.warn('Auth not ready after waiting, proceeding with navigation');
    }
  }
  
  const requiresAuth = to.meta.requiresAuth;
  const allowedRoles = to.meta.roles;
  
  // For routes that require auth, always check current auth state directly
  if (requiresAuth && !currentUser) {
    const user = await getCurrentUser(); // Directly check Firebase auth
    if (user) {
      currentUser = user; // Update currentUser if found
    }
  }
  
  // If route doesn't require auth, allow access
  if (!requiresAuth) {
    // If user is logged in and trying to access root/login/signup, redirect to their dashboard
    if (currentUser && (to.path === '/login' || to.path === '/signup')) {
      switch (currentUser.role) {
        case 'admin':
          next('/admin');
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
        next('/admin');
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
