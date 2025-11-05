// backend/scripts/update-guidebook-assets.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GUIDEBOOK_FILE = path.join(__dirname, '../../frontend/src/public/guidebook.json');
const ASSET_URLS_FILE = path.join(__dirname, '../../frontend/src/config/asset-urls.json');

function updateGuidebookAssets() {
  console.log('🔄 Updating guidebook.json with Firebase Storage URLs...\n');
  
  if (!fs.existsSync(GUIDEBOOK_FILE)) {
    console.error(`❌ Guidebook file not found: ${GUIDEBOOK_FILE}`);
    process.exit(1);
  }

  if (!fs.existsSync(ASSET_URLS_FILE)) {
    console.error(`❌ Asset URLs file not found: ${ASSET_URLS_FILE}`);
    console.error('   Please run "npm run upload-assets" first to generate asset URLs');
    process.exit(1);
  }

  // Read asset URLs mapping
  const assetUrls = JSON.parse(fs.readFileSync(ASSET_URLS_FILE, 'utf8'));
  
  // Read guidebook.json
  const guidebook = JSON.parse(fs.readFileSync(GUIDEBOOK_FILE, 'utf8'));
  let updatedCount = 0;

  // Update each entry's image_url
  for (const entry of guidebook) {
    if (entry.image_url) {
      // Extract filename from path like "/src/public/assets/MalayanColugo.png"
      const fileName = entry.image_url.split('/').pop();
      
      // Check if we have a Firebase Storage URL for this asset
      if (assetUrls[fileName]) {
        entry.image_url = assetUrls[fileName];
        updatedCount++;
        console.log(`✅ Updated: ${entry.common_name} -> ${fileName}`);
      } else {
        console.log(`⚠️  No Storage URL found for: ${fileName} (keeping original)`);
      }
    }
  }

  // Save updated guidebook
  fs.writeFileSync(GUIDEBOOK_FILE, JSON.stringify(guidebook, null, 2));
  console.log(`\n✅ Updated ${updatedCount} image URLs in guidebook.json`);
}

updateGuidebookAssets();
