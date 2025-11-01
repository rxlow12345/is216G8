/**
 * Utility functions for accessing user data in static HTML pages
 * These functions can be imported and used across different HTML files
 * 
 * This file requires Firebase to be initialized in the calling page
 * with window.firebaseAuth and window.firebaseDb set
 */

import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';
import { getDoc, doc } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';

// Get auth and db from window (set by calling page)
const getAuth = () => window.firebaseAuth;
const getDb = () => window.firebaseDb;

/**
 * Get current user data including role, username, email, and uid
 * @returns {Promise<Object|null>} User object or null
 */
export async function getCurrentUserData() {
  return new Promise((resolve) => {
    const auth = getAuth();
    const db = getDb();
    if (!auth || !db) {
      resolve(null);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      
      if (!user) {
        resolve(null);
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          resolve(null);
          return;
        }
        
        const userData = userDoc.data();
        resolve({
          uid: user.uid,
          username: userData.username,
          email: user.email,
          role: userData.role
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        resolve(null);
      }
    });
  });
}

/**
 * Check if user is authenticated and has the required role
 * @param {string} requiredRole - Required role ('admin', 'reporter', 'volunteer')
 * @returns {Promise<Object|null>} User object if authenticated and has role, null otherwise
 */
export async function checkRoleAccess(requiredRole) {
  const user = await getCurrentUserData();
  
  if (!user) {
    return null;
  }
  
  if (user.role !== requiredRole) {
    return null;
  }
  
  return user;
}

/**
 * Setup role-based access control with redirect
 * @param {string} requiredRole - Required role
 * @param {string} deniedRedirect - URL to redirect to if access denied (default: '/')
 * @param {Function} onSuccess - Callback when user has access
 * @param {Function} onDenied - Callback when access denied
 */
export async function setupRoleAccessControl(requiredRole, deniedRedirect = '/', onSuccess = null, onDenied = null) {
  return new Promise((resolve) => {
    const auth = getAuth();
    const db = getDb();
    if (!auth || !db) {
      window.location.href = '/login';
      resolve(false);
      return;
    }
    
    let handled = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (handled) return; // Prevent multiple calls
      handled = true;
      unsubscribe(); // Unsubscribe after first check
      
      if (!user) {
        console.log('No user logged in');
        window.location.href = '/login';
        resolve(false);
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          console.log('User document not found');
          window.location.href = '/login';
          resolve(false);
          return;
        }
        
        const userData = userDoc.data();
        const currentUser = {
          uid: user.uid,
          username: userData.username,
          email: user.email,
          role: userData.role
        };
        
        if (currentUser.role !== requiredRole) {
          console.log(`Access denied: Required role is ${requiredRole}, but user has role ${currentUser.role}`);
          if (onDenied) {
            onDenied(currentUser);
          }
          if (deniedRedirect) {
            window.location.href = deniedRedirect;
          }
          resolve(false);
          return;
        }
        
        // User has access
        if (onSuccess) {
          onSuccess(currentUser);
        }
        resolve(true);
      } catch (error) {
        console.error('Error checking role access:', error);
        window.location.href = '/login';
        resolve(false);
      }
    });
  });
}

/**
 * Display welcome message in a navbar element
 * @param {string} elementId - ID of the element to display welcome message
 * @param {Object} user - User object with username and email
 */
export function displayWelcomeMessage(elementId, user) {
  if (!user) return;
  
  const username = user.username || user.email;
  const welcomeMessage = document.getElementById(elementId);
  if (welcomeMessage && username) {
    welcomeMessage.textContent = `Welcome, ${username}`;
    welcomeMessage.style.display = 'block';
  }
}

/**
 * Store current user ID globally for use in forms
 * @returns {Function} Unsubscribe function
 */
export function storeCurrentUserId() {
  const auth = getAuth();
  if (!auth) {
    window.currentUserId = null;
    return;
  }
  
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      window.currentUserId = user.uid;
      console.log('User authenticated:', user.uid);
    } else {
      window.currentUserId = null;
    }
  });
}
