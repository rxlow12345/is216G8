import express from 'express';
import {
  createReport,
  //updateReportStatus -> to be included later
  uploadImage,
  getFallbackImage,
  identifySpecies
} from '../controllers/reportController.js';

const router = express.Router();

// Upload image to Firebase Storage
router.post('/upload-image', uploadImage);

// Serve fallback images
router.get('/images/:id', getFallbackImage);

// Create a new incident report
router.post('/', createReport);

// Species identification using SpeciesNet API
router.post('/identify-species', identifySpecies);


export default router;

