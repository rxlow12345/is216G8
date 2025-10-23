// frontend/src/api/auth.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

/**
 * Sign up a new user with email, password, and role
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} role - User's role ('admin', 'reporter', 'volunteer')
 * @returns {Promise<Object>} User object with uid and role
 */
export async function signup(email, password, role) {
  try {
    // Create user with Firebase Auth (Firebase Auth automatically prevents duplicate emails)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save user profile to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      role: role,
      createdAt: serverTimestamp()
    });
    
    // Sign out the user immediately so they can see success message and redirect to login
    await signOut(auth);
    
    return {
      uid: user.uid,
      email: user.email,
      role: role
    };
  } catch (error) {
    // Handle Firebase auth errors with better error messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account already exists with this email address. Please use a different email or try logging in.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please choose a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    } else {
      throw new Error(`Signup failed: ${error.message}`);
    }
  }
}

/**
 * Sign in an existing user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User object with uid, email, and role
 */
export async function login(email, password) {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch user role from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }
    
    const userData = userDoc.data();
    return {
      uid: user.uid,
      email: user.email,
      role: userData.role
    };
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
}

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(`Logout failed: ${error.message}`);
  }
}

/**
 * Get current user with role from Firestore
 * @returns {Promise<Object|null>} User object with role or null if not logged in
 */
export async function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      
      if (!user) {
        resolve(null);
        return;
      }
      
      try {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          resolve(null);
          return;
        }
        
        const userData = userDoc.data();
        resolve({
          uid: user.uid,
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
 * Listen to authentication state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Check user authentication and role with automatic redirect
 * @param {Object} router - Vue Router instance
 * @param {string} requiredRole - Required role for access ('admin', 'reporter', or 'volunteer')
 * @param {Object} reactiveData - Object containing userEmail and currentUser refs
 * @returns {Promise<boolean>} True if user is authenticated and has required role
 */
export async function checkUserAuthAndRole(router, requiredRole, reactiveData = {}) {
  try {
    // Get current user
    const user = await getCurrentUser();
    
    if (!user) {
      // User not logged in - redirect to login
      console.log('No user logged in, redirecting to login');
      router.push('/login');
      return false;
    }
    
    // Store user info in reactive data if provided
    if (reactiveData.userEmail) {
      reactiveData.userEmail.value = user.email;
    }
    if (reactiveData.currentUser) {
      reactiveData.currentUser.value = user;
    }
    
    // Check if user has required role
    if (user.role !== requiredRole) {
      // User doesn't have required role - redirect to their appropriate dashboard
      console.log(`User role is ${user.role}, redirecting to ${user.role} dashboard`);
      router.push(`/${user.role}/dashboard`);
      return false;
    }
    
    // User is authenticated and has correct role
    console.log(`${requiredRole} user authenticated:`, user.email);
    return true;
    
  } catch (error) {
    console.error('Error checking user authentication:', error);
    router.push('/login');
    return false;
  }
}

/**
 * Simple authentication check without role validation
 * @param {Object} router - Vue Router instance
 * @param {Object} reactiveData - Object containing userEmail and currentUser refs
 * @returns {Promise<boolean>} True if user is authenticated
 */
export async function checkUserAuth(router, reactiveData = {}) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('No user logged in, redirecting to login');
      router.push('/login');
      return false;
    }
    
    // Store user info in reactive data if provided
    if (reactiveData.userEmail) {
      reactiveData.userEmail.value = user.email;
    }
    if (reactiveData.currentUser) {
      reactiveData.currentUser.value = user;
    }
    
    console.log('User authenticated:', user.email, 'Role:', user.role);
    return true;
    
  } catch (error) {
    console.error('Error checking user authentication:', error);
    router.push('/login');
    return false;
  }
}