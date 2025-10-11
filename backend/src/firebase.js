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
const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || defaultPath;

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Error: [Firebase Init] service-account.json not found at: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (!getApps().length) {
  initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: serviceAccount.project_id + '.appspot.com'
  });
  console.log("[Firebase Init] Firebase Admin initialized with Storage");
}

export const db = getFirestore();
export const storage = getStorage();
export default admin;
