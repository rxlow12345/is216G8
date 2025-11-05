// backend/scripts/verify-storage-permissions.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load .env before importing Firebase
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, '../');
const rootDir = path.join(__dirname, '../../');
dotenv.config({ path: path.join(backendDir, '.env') });
dotenv.config({ path: path.join(rootDir, '.env') });

import '../src/firebase.js';
import { storage } from '../src/firebase.js';
import admin from 'firebase-admin';

const ASSET_URLS_FILE = path.join(__dirname, '../../frontend/src/config/asset-urls.json');

async function verifyAndFixPermissions() {
  console.log(' Verifying Firebase Storage file permissions...\n');

  if (!fs.existsSync(ASSET_URLS_FILE)) {
    console.error('Asset URLs file not found. Run "npm run upload-assets" first.');
    process.exit(1);
  }

  const assetUrls = JSON.parse(fs.readFileSync(ASSET_URLS_FILE, 'utf8'));
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || admin.app().options.storageBucket;
  
  if (!bucketName) {
    console.error('Could not determine bucket name');
    process.exit(1);
  }

  const bucket = storage.bucket(bucketName);
  console.log(` Using bucket: ${bucketName}\n`);

  let fixedCount = 0;
  let errorCount = 0;

  for (const [fileName, url] of Object.entries(assetUrls)) {
    const filePath = `assets/${fileName}`;
    const file = bucket.file(filePath);

    try {
      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        console.log(`File not found: ${filePath}`);
        errorCount++;
        continue;
      }

      // Check current permissions
      const [metadata] = await file.getMetadata();
      const isPublic = metadata.acl?.some(rule => rule.entity === 'allUsers' && rule.role === 'READER');

      if (!isPublic) {
        console.log(`🔓 Making ${fileName} publicly accessible...`);
        await file.makePublic();
        fixedCount++;
        console.log(`✅ Fixed: ${fileName}`);
      } else {
        console.log(`✅ ${fileName} is already public`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n✨ Done! Fixed ${fixedCount} files, ${errorCount} errors`);
}

verifyAndFixPermissions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
