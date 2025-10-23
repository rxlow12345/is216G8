// If u have npm installed in current folder,  run with: node dev-useOnly-create-admin.js
// else run: npm install firebase, then run with: node dev-useOnly-create-admin.js

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';


const firebaseConfig = {
  // Replace with .env data
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminAccount() {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = '123456';
    
    console.log('Creating admin account...');
    
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('✅ Admin user created in Firebase Auth:', user.uid);
    
    // Create user profile in Firestore with admin role
    await setDoc(doc(db, 'users', user.uid), {
      email: adminEmail,
      role: 'admin',
      createdAt: serverTimestamp()
    });
    
    console.log('✅ Admin profile created in Firestore');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
  }
}

// Run the function
createAdminAccount();
