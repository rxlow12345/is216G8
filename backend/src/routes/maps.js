import express from 'express';
import {
    getByGeoSpatial
} from '../controllers/mapController.js';

const router = express.Router();

// Get incident via lat, lng, & radius
// Function added on 28/10/2025 by Charlize
router.get('/getByGeoSpatial', getByGeoSpatial);

export default router;