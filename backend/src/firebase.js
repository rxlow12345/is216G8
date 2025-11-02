// backend/src/firebase.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefer env, fallback to default path
const defaultPath = path.join(__dirname, "../service-account.json");
let serviceAccount;

try {
  if (process.env.FIREBASE_PROJECT_ID) {
    // Use environment variables
    serviceAccount = {
      "type": "service_account",
      "project_id": process.env.FIREBASE_PROJECT_ID,
      "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
      "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle escaped newlines
      "client_email": process.env.FIREBASE_CLIENT_EMAIL,
      "client_id": process.env.FIREBASE_CLIENT_ID,
      "auth_uri": process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
      "token_uri": process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL,
      "universe_domain": "googleapis.com"
    };
    console.log("[Firebase Init] Using environment variables for Firebase configuration");
  } else if (fs.existsSync(defaultPath)) {
    // Use service account file
    serviceAccount = JSON.parse(fs.readFileSync(defaultPath, "utf8"));
    console.log("[Firebase Init] Using service-account.json for Firebase configuration");
  } else {
    throw new Error(`Firebase configuration not found. Please either:
1. Set Firebase environment variables (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, etc.)
2. Place service-account.json file at: ${defaultPath}`);
  }
} catch (error) {
  console.error("[Firebase Init] Error loading Firebase configuration:", error.message);
  throw error;
}

// if (!fs.existsSync(serviceAccountPath)) {
//   console.error(`Error: [Firebase Init] service-account.json not found at: ${serviceAccountPath}`);
//   process.exit(1);
// }

// const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (!getApps().length) {
  try {
    initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: serviceAccount.project_id + '.appspot.com'
    });
    console.log(`[Firebase Init] Firebase Admin initialized with Storage (Project: ${serviceAccount.project_id})`);
  } catch (error) {
    console.error("[Firebase Init] Failed to initialize Firebase:", error.message);
    throw error;
  }
} else {
  console.log("[Firebase Init] Firebase Admin already initialized");
}

export const db = getFirestore();
export const storage = getStorage();
export default admin;
