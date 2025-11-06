import express from 'express';
import {
  createReport,
  //updateReportStatus -> to be included later
  uploadImage,
  getFallbackImage,
  identifySpecies,
  getAllReports,
  getReportById,
  getReportByReportId,
  updateReportStatus,
  updateReportFields,
  deleteReport,
  getActiveSummary,
  getUserEmail,
  getVolunteerName
} from '../controllers/reportController.js';

const router = express.Router();

// Reverse Geocoding endpoint (proxy to avoid CORS)
// Uses Nominatim (OpenStreetMap) from the backend to bypass browser CORS
router.get('/reverse-geocode', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: 'Missing lat or lon parameter' });
    }

    console.log(`Reverse geocoding request: ${lat}, ${lon}`);

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'CritterConnect/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.display_name) {
      // Extract key address components
      const addr = data.address || {};
      
      // Build address: [Building/Landmark], [Street], Singapore [Postal Code]
      let addressParts = [];
      
      // 1. Building/Landmark (if available)
      if (addr.building || addr.amenity || addr.shop || addr.tourism) {
        addressParts.push(addr.building || addr.amenity || addr.shop || addr.tourism);
      }
      
      // 2. Street with house number
      let street = '';
      if (addr.house_number && addr.road) {
        street = `${addr.house_number} ${addr.road}`;
      } else if (addr.road) {
        street = addr.road;
      } else if (addr.pedestrian) {
        street = addr.pedestrian;
      }
      
      if (street) {
        addressParts.push(street);
      }
      
      // 3. "Singapore [Postal Code]" - postal code attached with space, no comma
      let singaporePart = 'Singapore';
      if (addr.postcode) {
        singaporePart = `Singapore ${addr.postcode}`;
      }
      addressParts.push(singaporePart);
      
      // Join with commas
      const address = addressParts.join(', ');
      
      const postalCode = addr.postcode || null;
      const countryCode = addr.country_code || null;
      const isWater =
        (data.category === 'natural' && (data.type === 'water' || data.type === 'coastline')) ||
        data.category === 'waterway' ||
        /\b(ocean|sea|strait|bay|water|beach)\b/i.test(data.display_name);

      console.log(`✅ Formatted address: ${address}`);

      return res.json({
        success: true,
        data: {
          address,
          postalCode,
          countryCode,
          isWater,
          lat: parseFloat(data.lat),
          lon: parseFloat(data.lon),
        },
      });
    }

    throw new Error('No results from Nominatim');
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Upload image to Firebase Storage
router.post('/upload-image', uploadImage);

// Serve fallback images
router.get('/images/:id', getFallbackImage);

// Create a new incident report
router.post('/', createReport);

// Create a new incident report
// Function added on 28/10/2025 by Charlize
router.delete('/', deleteReport);

// Species identification using SpeciesNet API
router.post('/identify-species', identifySpecies);

// Gets a single report document from Firestore by its ID.
router.get('/getAllReports', getAllReports);

// Gets a single report document from Firestore by its report ID.
router.get('/getReport/reportId/:id', getReportByReportId);

// Gets a single report document from Firestore by its Firebase document ID.
router.get('/getReport/docId/:id', getReportById);

// Updates the status of a single report document in Firestore.
router.post('/updateReport/:id', updateReportStatus);

// Updates the fields of a single report document in Firestore.
router.post('/updateReportFields/:id', updateReportFields);

// Gets summary details of report by reportId
router.get('/getReport/activeSummary/:id', getActiveSummary);

// Gets email of user who reported the case
router.get('/getReport/email/:id', getUserEmail);

// Gets name of volunteer assigned to the case
router.get('/getReport/volunteerName/:id', getVolunteerName);

export default router;

