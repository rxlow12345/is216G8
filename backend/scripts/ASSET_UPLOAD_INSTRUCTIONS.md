# Asset Upload Instructions

This guide explains how to upload all images from `frontend/src/public/assets` to Firebase Storage and update references in codebase.

## Step 1: Upload Assets to Firebase Storage

Run the upload script from the backend directory:

```bash
cd backend
npm run upload-assets
```

This script will:
- Find all image files in `frontend/src/public/assets`
- Upload each file to Firebase Storage at `assets/{filename}`
- Make all files publicly accessible
- Generate a mapping file at `frontend/src/config/asset-urls.json`

**Note:** The script will skip files that already exist in Storage (to avoid re-uploading).

## Step 2: Update guidebook.json

After uploading, update the guidebook with Firebase Storage URLs:

```bash
npm run update-guidebook
```

This updates all `image_url` fields in `frontend/src/public/guidebook.json` to use Firebase Storage URLs.

## Step 3: Update Code References

### Using the Utility Function (Recommended)

Import and use the `getAssetUrl` utility function in your Vue components:

```javascript
import { getAssetUrl } from '@/utils/getAssetUrl';

// In your component
const logoUrl = getAssetUrl('logo.png');
// or
const logoUrl = getAssetUrl('/src/public/assets/logo.png');
```

### Example Updates

**Before:**
```vue
<img src="/src/public/assets/logo.png" alt="Logo">
```

**After:**
```vue
<script setup>
import { getAssetUrl } from '@/utils/getAssetUrl';
</script>

<template>
  <img :src="getAssetUrl('logo.png')" alt="Logo">
</template>
```

## Files That Need Updates

The following files reference assets and should be updated to use the utility function:

1. **Vue Components:**
   - `frontend/pages/Home.vue` 
   - `frontend/src/components/Donate.vue` 
   - `frontend/pages/volunteer/VolunteerDashboard.vue` 

2. **HTML Files:**
   - `frontend/public/home.html`
   - `frontend/pages/home.html`
   - `frontend/public/new_report/report.html`
   - `frontend/pages/new_report/report.html`

3. **JavaScript Files:**
   - `frontend/public/new_report/report.js`
   - `frontend/pages/js/common.js`

4. **JSON Files:**
   - `frontend/src/public/guidebook.json` (automatically updated by script)

## How It Works

1. **Development:** The utility function falls back to local paths (`/src/public/assets/...`) if no Firebase Storage URL is found.

2. **Production:** After running the upload script, all assets are served from Firebase Storage with URLs like:
   ```
   https://storage.googleapis.com/YOUR_BUCKET/assets/logo.png
   ```


## Troubleshooting

### Error: "Firebase Storage is not initialized"
- Make sure your `.env` file has Firebase credentials
- Ensure `backend/service-account.json` exists or environment variables are set

### Images still not showing in production
- Verify assets were uploaded successfully (check Firebase Console)
- Ensure `asset-urls.json` was generated correctly
- Check browser console for 404 errors
- Verify Firebase Storage bucket permissions allow public read access

### Script fails on certain files
- Check file sizes (very large files may timeout)
- Ensure you have sufficient Firebase Storage quota
- Check file names for special characters

## Manual Update (If Needed)

If you need to manually reference a Firebase Storage URL:

```javascript
// Direct Firebase Storage URL
const imageUrl = 'https://storage.googleapis.com/YOUR_BUCKET/assets/filename.png';
```

But using the utility function is recommended for automatic fallback support.
