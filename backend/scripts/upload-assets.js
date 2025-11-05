// backend/scripts/upload-assets.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load .env from backend directory (or root as fallback) - this runs after imports evaluate
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, '../');
const rootDir = path.join(__dirname, '../../');
dotenv.config({ path: path.join(backendDir, '.env') });
dotenv.config({ path: path.join(rootDir, '.env') }); // Fallback to root .env

import '../src/firebase.js'; // Initialize Firebase Admin
import { storage } from '../src/firebase.js';
import admin from '../src/firebase.js';

const ASSETS_DIR = path.join(__dirname, '../../frontend/src/public/assets');
const OUTPUT_MAP_FILE = path.join(__dirname, '../../frontend/src/config/asset-urls.json');

// Image extensions to upload
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'];

/**
 * Upload a single file to Firebase Storage
 */
async function uploadFileToStorage(filePath, fileName, bucketName, bucketInstance = null) {
  try {
    // Use provided bucket instance or create new one
    const bucket = bucketInstance || storage.bucket(bucketName);
    const destinationPath = `assets/${fileName}`;
    const file = bucket.file(destinationPath);

    // Check if file already exists
    const [exists] = await file.exists();
    if (exists) {
      console.log(`⚠️  File already exists: ${fileName}, skipping...`);
      // Get existing URL
      await file.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
      return publicUrl;
    }

    // Upload the file
    await bucket.upload(filePath, {
      destination: destinationPath,
      metadata: {
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
    });

    // Make the file publicly accessible
    await file.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
    console.log(`✅ Uploaded: ${fileName} -> ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`❌ Error uploading ${fileName}:`, error.message);
    throw error;
  }
}

/**
 * Get all image files from assets directory
 */
function getImageFiles(dir) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext) && item !== 'desktop.ini') {
          files.push({
            name: item,
            path: fullPath
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Main upload function
 */
async function uploadAllAssets() {
  console.log('🚀 Starting asset upload to Firebase Storage...\n');
  
  // Get storage bucket name from Firebase app config or environment variable
  let bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  
  if (!bucketName) {
    // Try to get from Firebase app (which should already be initialized)
    try {
      const app = admin.app();
      bucketName = app.options.storageBucket;
      if (bucketName) {
        console.log(`   ℹ️  Auto-detected bucket from Firebase app: ${bucketName}`);
      }
    } catch (error) {
      console.error('   ⚠️  Could not get bucket from Firebase app:', error.message);
    }
  }
  
  // Fallback: try to get default bucket name
  if (!bucketName) {
    try {
      const defaultBucket = storage.bucket();
      bucketName = defaultBucket.name;
      if (bucketName) {
        console.log(`   ℹ️  Using default bucket: ${bucketName}`);
      }
    } catch (err) {
      console.error('   ⚠️  Could not get default bucket:', err.message);
    }
  }
  
  // If we got .appspot.com format, also try .firebasestorage.app format
  // (Firebase Storage now uses .firebasestorage.app for new projects)
  if (bucketName && bucketName.endsWith('.appspot.com')) {
    const firebasestorageName = bucketName.replace('.appspot.com', '.firebasestorage.app');
    console.log(`   ℹ️  Will also try: ${firebasestorageName}`);
  }
  
  if (!bucketName) {
    console.error('❌ Storage bucket name not found!');
    console.error('   Please set FIREBASE_STORAGE_BUCKET in your .env file');
    console.error('   Example: FIREBASE_STORAGE_BUCKET=wad2-92dca.appspot.com');
    process.exit(1);
  }
  
  console.log(`📦 Using storage bucket: ${bucketName}\n`);
  
  // Get bucket reference and verify it exists
  // Try multiple bucket name formats to find the correct one
  let bucket;
  const bucketNameVariants = [
    bucketName, // Original
    bucketName.replace('.appspot.com', '.firebasestorage.app'), // New format
    bucketName.replace('.firebasestorage.app', '.appspot.com'), // Old format
    bucketName.replace(/\.(appspot\.com|firebasestorage\.app)$/, ''), // Just project ID
  ].filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicates
  
  let foundBucket = null;
  let foundBucketName = null;
  
  for (const variant of bucketNameVariants) {
    try {
      const testBucket = storage.bucket(variant);
      const [exists] = await testBucket.exists();
      if (exists) {
        foundBucket = testBucket;
        foundBucketName = variant;
        console.log(`✅ Found bucket: ${variant}`);
        break;
      }
    } catch (err) {
      // Continue to next variant
      continue;
    }
  }
  
  if (!foundBucket) {
    // If no bucket found, try using the default bucket or original name
    console.log(`⚠️  Could not verify bucket exists, using: ${bucketName}`);
    console.log('   Will attempt upload anyway...');
    bucket = storage.bucket(bucketName);
  } else {
    bucket = foundBucket;
    bucketName = foundBucketName;
  }
  
  // Check if assets directory exists
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`❌ Assets directory not found: ${ASSETS_DIR}`);
    process.exit(1);
  }

  // Get all image files
  const imageFiles = getImageFiles(ASSETS_DIR);
  console.log(`📁 Found ${imageFiles.length} image files\n`);

  if (imageFiles.length === 0) {
    console.log('⚠️  No image files found to upload');
    return;
  }

  // Create URL mapping object
  const urlMap = {};
  
  // Upload each file
  for (const file of imageFiles) {
    try {
      const publicUrl = await uploadFileToStorage(file.path, file.name, bucketName, bucket);
      urlMap[file.name] = publicUrl;
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error.message);
      // Continue with other files even if one fails
    }
  }

  // Save mapping to JSON file
  const outputDir = path.dirname(OUTPUT_MAP_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_MAP_FILE, JSON.stringify(urlMap, null, 2));
  console.log(`\n✅ Asset URL mapping saved to: ${OUTPUT_MAP_FILE}`);
  console.log(`\n📊 Summary: ${Object.keys(urlMap).length} files uploaded successfully`);
}

// Run the script
uploadAllAssets()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
