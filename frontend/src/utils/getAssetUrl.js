// frontend/src/utils/getAssetUrl.js
// Import asset URLs - Vite handles JSON imports natively
import assetUrlsModule from '../config/asset-urls.json';

const assetUrls = assetUrlsModule || {};

/**
 * Get the URL for an asset (from Firebase Storage if available, otherwise local path)
 * @param {string} assetName - Name of the asset file (e.g., 'logo.png' or '/src/public/assets/logo.png')
 * @returns {string} - URL to the asset
 */
export function getAssetUrl(assetName) {
  // Extract just the filename if a full path is provided
  const fileName = assetName.split('/').pop();
  
  // Check if we have a Firebase Storage URL for this asset
  if (assetUrls && assetUrls[fileName]) {
    return assetUrls[fileName];
  }
  
  // Fallback to local path (works in development)
  // Remove 'assets/' prefix if present
  const cleanName = fileName.startsWith('assets/') 
    ? fileName.replace('assets/', '') 
    : fileName;
  
  // Handle both /src/public/assets/ and relative paths
  if (assetName.startsWith('/src/public/assets/')) {
    return assetName;
  }
  
  return `/src/public/assets/${cleanName}`;
}

/**
 * Get multiple asset URLs
 * @param {string[]} assetNames - Array of asset file names
 * @returns {Object} - Object mapping asset names to URLs
 */
export function getAssetUrls(assetNames) {
  const urls = {};
  for (const name of assetNames) {
    urls[name] = getAssetUrl(name);
  }
  return urls;
}

export default getAssetUrl;
