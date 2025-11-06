// Development script to create test accounts (admin/volunteer)
// Usage: node create-test-accounts.js
// Make sure to have firebase and dotenv installed: npm install firebase dotenv

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Check if environment variables are loaded
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('\nPlease check your .env file and make sure all Firebase configuration variables are set.');
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminAccount(adminEmail, adminPassword, username) {
  try {    
    console.log('Creating admin account...');
    
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('✅ Admin user created in Firebase Auth:', user.uid);
    
    // Create user profile in Firestore with admin role
    await setDoc(doc(db, 'users', user.uid), {
      email: adminEmail,
      role: 'admin',
      username: username,
      createdAt: serverTimestamp(),
      user: user.uid
    });
    
    console.log('✅ Admin profile created in Firestore');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
  }
}

async function createVolunteerAccount(volunteerEmail, volunteerPassword, username) {
  try {
    console.log('Creating volunteer account...');
    
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, volunteerEmail, volunteerPassword);
    const user = userCredential.user;
    
    console.log('✅ Volunteer user created in Firebase Auth:', user.uid);
    
    // Create user profile in Firestore with admin role
    await setDoc(doc(db, 'users', user.uid), {
      email: volunteerEmail,
      role: 'volunteer',
      username: username,
      createdAt: serverTimestamp(),
      user: user.uid
    });
    
    console.log('✅ Volunteer profile created in Firestore');
    console.log('Email:', volunteerEmail);
    console.log('Password:', volunteerPassword);
    console.log('Role: volunteer');
    
  } catch (error) {
    console.error('❌ Error creating volunteer account:', error.message);
  }
}

// Run the functions
createAdminAccount('supremeadmin@gmail.com', '123456', 'supreme admin');
createVolunteerAccount('volunteer999@gmail.com', '123456', 'supreme volunteer');