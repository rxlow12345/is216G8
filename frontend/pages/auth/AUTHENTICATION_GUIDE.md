# Authentication System Guide

  

  

## Overview

  

This guide explains how to use the Firebase authentication system implemented in the CritterConnect application. The system provides role-based access control with three user types: admin, reporter, and volunteer.

  

## 🚀 Getting Started

### 1. Environment Setup

  
Make sure you have the Firebase configuration in your `.env` file and it placed under `frontend` folder:

  

```env

  

VITE_FIREBASE_API_KEY=your_api_key

  

VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com

  

VITE_FIREBASE_PROJECT_ID=your_project_id

  

VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com

  

VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

  

VITE_FIREBASE_APP_ID=your_app_id

  

```

  

  

### 2. Dependencies

  

Ensure you have the required packages installed:

  

```bash

  

npm install firebase vue-router

  

```
  

  
### Default Admin Account

  

**⚠️ IMPORTANT**: There is already an admin account created in Firebase:

  

- **Email**: `admin@gmail.com`

- **Password**: `123456`  

- **Role**: `admin`

  


### Creating New Admin Accounts

  

To create additional admin or volunteer accounts, you need to modify the `create-test-accounts.js` script:

  

```javascript

  

// Edit these values in create-test-accounts.js

  

createAdminAccount('newadmin@yourdomain.com', 'NewSecurePassword123!', 'Admin Name');

createVolunteerAccount('volunteer@yourdomain.com', 'NewSecurePassword123!', 'Volunteer Name');

  

```

  

  

Then run the script:

  

```bash

  

node create-test-accounts.js

  

```

  
## Authentication API Usage

### Import Authentication Functions

  

```javascript

  

import {

  

  signup,

  

  login,

  

  logout,

  

  getCurrentUser,

  

  onAuthStateChange

  

} from '../api/auth.js';  // Adjust path based on your file location

  

```

  

  

### User Signup

  

```javascript

  

try {

  

  const user = await signup(email, password, role);

  

  console.log('User created:', user);

  

  // Redirect to appropriate dashboard

  

} catch (error) {

  

  console.error('Signup failed:', error.message);

  

}

  

```

  

  

### User Login

  

```javascript

  

try {

  

  const user = await login(email, password);

  

  console.log('User logged in:', user);

  

  // User object contains: { uid, email, role }

  

} catch (error) {

  

  console.error('Login failed:', error.message);

  

}

  

```

   

### User Logout

  

```javascript

  

try {

  

  await logout();

  

  // User is signed out and redirected to login page

  

} catch (error) {

  

  console.error('Logout failed:', error.message);

  

}

  

```

  

  

### Get Current User

  

```javascript

  

const user = await getCurrentUser();

  

if (user) {

  

  console.log('Current user:', user);

  

  // User object contains: { uid, email, role }

  

} else {

  

  console.log('No user logged in');

  

}

  

```

  

  

## 🛡️ Role-Based Access Control

  

  

### Router Protection

  

The router automatically handles role-based access:

  

  

```javascript

  

// In router/index.js

  

const routes = [

  

  {

  

    path: '/report',

  

    name: 'ReporterDashboard',

  

    component: ReporterDashboard,

  

    meta: { requiresAuth: true, roles: ['reporter'] }

  

  },

  

  {

  

    path: '/volunteer/home',

  

    name: 'VolunteerDashboard',

  

    component: VolunteerDashboard,

  

    meta: { requiresAuth: true, roles: ['volunteer'] }

  

  },

  

  {

  

    path: '/status-update',

  

    name: 'StatusUpdate',

  

    component: StatusUpdate,

  

    meta: { requiresAuth: true, roles: ['admin', 'volunteer'] }

  

  }

  

];

  

```

  

  

##  How to Implement User Authentication in Different File Types

  

  

### 1. Vue Components (Frontend Pages)


#### **Admin Pages** - `frontend/src/pages/admin/YourAdminPage.vue`

  

```javascript

  

<template>

  

  <div class="container-fluid">

  

    <!-- Header with Logout -->

  

    <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">

  

      <div class="container">

  

        <span class="navbar-brand mb-0 h1">Your Admin Page</span>

  

        <div class="navbar-nav ms-auto">

  

          <span class="navbar-text me-3">Welcome, {{ userEmail }}</span>

  

          <button class="btn btn-outline-light" @click="handleLogout">

  

            <i class="bi bi-box-arrow-right"></i> Logout

  

          </button>

  

        </div>

  

      </div>

  

    </nav>

  

  

    <!-- Main Content -->

  

    <div class="container">

  

      <!-- Your admin page content here -->

  

    </div>

  

  </div>

  

</template>

  

  

<script setup>

  

import { ref, onMounted } from 'vue';

  

import { useRouter } from 'vue-router';

  

import { logout, checkUserAuthAndRole } from '../../api/auth.js';  

  

  

// Reactive data

  

const userEmail = ref('');

  

const currentUser = ref(null);

  

  

// Router instance

  

const router = useRouter();

  

  

/**

  

 * Check user authentication and role on component mount

  

 */

  

onMounted(async () => {

  

  // Use the utility function for cleaner code

  

  await checkUserAuthAndRole(router, 'admin', { userEmail, currentUser });

  

});

  

  

/**

  

 * Handle logout

  

 */

  

async function handleLogout() {

  

  try {

  

    await logout();

  

    router.push('/login');

  

  } catch (error) {

  

    console.error('Logout error:', error);

  

    alert('Logout failed. Please try again.');

  

  }

  

}

  

</script>

  

```

  

#### **Reporter Pages** - `frontend/src/pages/reporter/YourReporterPage.vue`

  

```javascript

  

<template>

  

  <div class="container-fluid">

  

    <!-- Header with Logout -->

  

    <nav class="navbar navbar-expand-lg navbar-dark bg-success mb-4">

  

      <div class="container">

  

        <span class="navbar-brand mb-0 h1">Your Reporter Page</span>

  

        <div class="navbar-nav ms-auto">

  

          <span class="navbar-text me-3">Welcome, {{ userEmail }}</span>

  

          <button class="btn btn-outline-light" @click="handleLogout">

  

            <i class="bi bi-box-arrow-right"></i> Logout

  

          </button>

  

        </div>

  

      </div>

  

    </nav>

  

  

    <!-- Main Content -->

  

    <div class="container">

  

      <!-- Your reporter page content here -->

  

    </div>

  

  </div>

  

</template>

  

  

<script setup>

  

import { ref, onMounted } from 'vue';

  

import { useRouter } from 'vue-router';

  

import { logout, checkUserAuthAndRole } from '../../api/auth.js';

  

  

// Reactive data

  

const userEmail = ref('');

  

const currentUser = ref(null);

  

  

// Router instance

  

const router = useRouter();

  

  

/**

  

 * Check user authentication and role on component mount

  

 */

  

onMounted(async () => {

  

  // Use the utility function for cleaner code

  

  await checkUserAuthAndRole(router, 'reporter', { userEmail, currentUser });

  

});

  

  

/**

  

 * Handle logout

  

 */

  

async function handleLogout() {

  

  try {

  

    await logout();

  

    router.push('/login');

  

  } catch (error) {

  

    console.error('Logout error:', error);

  

    alert('Logout failed. Please try again.');

  

  }

  

}

  

</script>

  

```

  

  

#### **Volunteer Pages** - `frontend/src/pages/volunteer/YourVolunteerPage.vue`

  

```javascript

  

<template>

  

  <div class="container-fluid">

  

    <!-- Header with Logout -->

  

    <nav class="navbar navbar-expand-lg navbar-dark bg-warning mb-4">

  

      <div class="container">

  

        <span class="navbar-brand mb-0 h1">Your Volunteer Page</span>

  

        <div class="navbar-nav ms-auto">

  

          <span class="navbar-text me-3">Welcome, {{ userEmail }}</span>

  

          <button class="btn btn-outline-light" @click="handleLogout">

  

            <i class="bi bi-box-arrow-right"></i> Logout

  

          </button>

  

        </div>

  

      </div>

  

    </nav>

  

  

    <!-- Main Content -->

  

    <div class="container">

  

      <!-- Your volunteer page content here -->

  

    </div>

  

  </div>

  

</template>

  

  

<script setup>

  

import { ref, onMounted } from 'vue';

  

import { useRouter } from 'vue-router';

  

import { logout, checkUserAuthAndRole } from '../../api/auth.js';

  

  

// Reactive data

  

const userEmail = ref('');

  

const currentUser = ref(null);

  

  

// Router instance

  

const router = useRouter();

  

  

/**

  

 * Check user authentication and role on component mount

  

 */

  

onMounted(async () => {

  

  // Use the utility function for cleaner code

  

  await checkUserAuthAndRole(router, 'volunteer', { userEmail, currentUser });

  

});

  

  

/**

  

 * Handle logout

  

 */

  

async function handleLogout() {

  

  try {

  

    await logout();

  

    router.push('/login');

  

  } catch (error) {

  

    console.error('Logout error:', error);

  

    alert('Logout failed. Please try again.');

  

  }

  

}

  

</script>

  

```

  

  

### 2. JavaScript Files (Frontend Logic)

  
#### **API Files** - `frontend/src/api/yourApi.js`

  

```javascript

  

import { getCurrentUser } from './auth.js';

  

  

// Function to check user authentication before API calls

  

async function checkUserAuth() {

  

  try {

  

    const user = await getCurrentUser();

  

    if (!user) {

  

      console.log('User not logged in');

  

      // Redirect to login page

  

      window.location.href = '/login';

  

      return null;

  

    }

  

    console.log('User logged in:', user.email, 'Role:', user.role);

  

    return user;

  

  } catch (error) {

  

    console.error('Auth check failed:', error);

  

    window.location.href = '/login';

  

    return null;

  

  }

  

}

  

  

// Function to check specific role

  

async function checkUserRole(requiredRole) {

  

  const user = await checkUserAuth();

  

  if (!user) return false;

  

  if (user.role !== requiredRole) {

  

    alert(`Access denied. Required role: ${requiredRole}`);

  

    return false;

  

  }

  

  return true;

  

}

  

  

// Usage examples:

  

export async function adminOnlyFunction() {

  

  if (await checkUserRole('admin')) {

  

    // Admin-only code here

  

    console.log('Admin action performed');

  

    return true;

  

  }

  

  return false;

  

}

  

  

export async function reporterOnlyFunction() {

  

  if (await checkUserRole('reporter')) {

  

    // Reporter-only code here

  

    console.log('Reporter action performed');

  

    return true;

  

  }

  

  return false;

  

}

  

  

export async function volunteerOnlyFunction() {

  

  if (await checkUserRole('volunteer')) {

  

    // Volunteer-only code here

  

    console.log('Volunteer action performed');

  

    return true;

  

  }

  

  return false;

  

}

  

```

  

  

#### **Utility Files** - `frontend/src/utils/yourUtils.js`

  

```javascript

  

import { getCurrentUser } from '../api/auth.js';

  

  

// Utility function to get current user info

  

export async function getCurrentUserInfo() {

  

  try {

  

    const user = await getCurrentUser();

  

    return user;

  

  } catch (error) {

  

    console.error('Error getting user info:', error);

  

    return null;

  

  }

  

}

  

  

// Utility function to check if user has specific role

  

export async function hasRole(requiredRole) {

  

  const user = await getCurrentUserInfo();

  

  return user && user.role === requiredRole;

  

}

  

  

// Utility function to check if user has any of the specified roles

  

export async function hasAnyRole(roles) {

  

  const user = await getCurrentUserInfo();

  

  return user && roles.includes(user.role);

  

}

  

```

  

  

### 3. Backend Files (Node.js)

  

  

#### **Controllers** - `backend/src/controllers/yourController.js`

  

```javascript

  

const { getAuth } = require('firebase-admin/auth');

  

const admin = require('firebase-admin');

  

  

// Middleware to verify user authentication

  

async function verifyAuth(req, res, next) {

  

  try {

  

    const authHeader = req.headers.authorization;

  

    if (!authHeader || !authHeader.startsWith('Bearer ')) {

  

      return res.status(401).json({ error: 'No token provided' });

  

    }

  

    const token = authHeader.split('Bearer ')[1];

  

    // Verify the token with Firebase Admin

  

    const decodedToken = await getAuth().verifyIdToken(token);

  

    // Add user info to request object

  

    req.user = {

  

      uid: decodedToken.uid,

  

      email: decodedToken.email

  

    };

  

    next();

  

  } catch (error) {

  

    console.error('Token verification failed:', error);

  

    return res.status(401).json({ error: 'Invalid token' });

  

  }

  

}

  

  

// Middleware to check user role

  

async function checkRole(requiredRole) {

  

  return async (req, res, next) => {

  

    try {

  

      // Get user role from Firestore

  

      const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();

  

      if (!userDoc.exists) {

  

        return res.status(404).json({ error: 'User profile not found' });

  

      }

  

      const userData = userDoc.data();

  

      if (userData.role !== requiredRole) {

  

        return res.status(403).json({

  

          error: `Access denied. Required role: ${requiredRole}`

  

        });

  

      }

  

      // Add role to request object

  

      req.user.role = userData.role;

  

      next();

  

    } catch (error) {

  

      console.error('Role check failed:', error);

  

      return res.status(500).json({ error: 'Internal server error' });

  

    }

  

  };

  

}

  

  

// Usage in routes:

  

app.get('/admin-only', verifyAuth, checkRole('admin'), (req, res) => {

  

  // Admin-only endpoint

  

  res.json({ message: 'Admin access granted', user: req.user });

  

});

  

  

app.get('/reporter-only', verifyAuth, checkRole('reporter'), (req, res) => {

  

  // Reporter-only endpoint

  

  res.json({ message: 'Reporter access granted', user: req.user });

  

});

  

  

app.get('/volunteer-only', verifyAuth, checkRole('volunteer'), (req, res) => {

  

  // Volunteer-only endpoint

  

  res.json({ message: 'Volunteer access granted', user: req.user });

  

});

  

  

// Note: Each user has only one role, so no multiple roles needed

  

```

  

  

#### **Routes** - `backend/src/routes/yourRoutes.js`

  

```javascript

  

const express = require('express');

  

const router = express.Router();

  

const { verifyAuth, checkRole } = require('../controllers/yourController');

  

  

// Protected routes with role checking

  

router.get('/admin-dashboard', verifyAuth, checkRole('admin'), (req, res) => {

  

  res.json({ message: 'Admin dashboard data', user: req.user });

  

});

  

  

router.get('/reporter-dashboard', verifyAuth, checkRole('reporter'), (req, res) => {

  

  res.json({ message: 'Reporter dashboard data', user: req.user });

  

});

  

  

router.get('/volunteer-dashboard', verifyAuth, checkRole('volunteer'), (req, res) => {

  

  res.json({ message: 'Volunteer dashboard data', user: req.user });

  

});

  

  

module.exports = router;

  

```

  

  

## 🎯 **Key Methods

  

#### **`checkUserAuthAndRole(router, requiredRole, reactiveData)`**

  

- **Purpose**: Checks user authentication and role with automatic redirect

  

- **Parameters**:

  

  - `router`: Vue Router instance

  

  - `requiredRole`: Required role string ('admin', 'reporter', or 'volunteer')

  

  - `reactiveData`: Object containing `userEmail` and `currentUser` refs

  

- **Returns**: `Promise<boolean>` - true if authenticated and has required role

  

  

#### **`checkUserAuth(router, reactiveData)`**

  

- **Purpose**: Simple authentication check without role validation

  

- **Parameters**:

  

  - `router`: Vue Router instance

  

  - `reactiveData`: Object containing `userEmail` and `currentUser` refs

  

- **Returns**: `Promise<boolean>` - true if authenticated

  

  

### **Usage Examples**

  

  

```javascript

  

// Admin role check

  

await checkUserAuthAndRole(router, 'admin', { userEmail, currentUser });

  

  

// Reporter role check

  

await checkUserAuthAndRole(router, 'reporter', { userEmail, currentUser });

  

  

// Volunteer role check

  

await checkUserAuthAndRole(router, 'volunteer', { userEmail, currentUser });

  

  

// Simple authentication check (no role validation)

  

await checkUserAuth(router, { userEmail, currentUser });

  

```

  

  

### **Role Checking Patterns**

  

```javascript

  

// Admin role check

  

if (user.role !== 'admin') {

  

  router.push(`/${user.role}/dashboard`);

  

  return;

  

}

  

// Reporter role check

  

if (user.role !== 'reporter') {

  

  router.push(`/${user.role}/dashboard`);

  

  return;

  

}

  

// Volunteer role check

  

if (user.role !== 'volunteer') {

  

  router.push(`/${user.role}/dashboard`);

  

  return;

  

}

  

```

  

  

### **Router Configuration**

  

Don't forget to add your new pages to the router in `frontend/router/index.js`:

  

```javascript

  

{

  

  path: '/your-new-page',

  

  name: 'YourNewPage',

  

  component: YourNewPage,

  

  meta: { requiresAuth: true, roles: ['admin'] }  // Adjust roles as needed

  

}

  

```

  

  

##  Persistent Login


### Implementation

  

The router automatically checks authentication state on app startup:

  

  

```javascript

  

// In router/index.js

  

onAuthStateChange(async (user) => {

  

  isAuthReady = true;

  

  if (user) {

  

    // User is logged in, fetch their role

  

    currentUser = await getCurrentUser();

  

  } else {

  

    currentUser = null;

  

  }

  

  // Handle navigation based on auth state

  

  handleAuthNavigation();

  

});

  

```