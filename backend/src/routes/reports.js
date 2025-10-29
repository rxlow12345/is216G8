import express from 'express';
import {
  createReport,
  //updateReportStatus -> to be included later
  uploadImage,
  getFallbackImage,
  identifySpecies,
  getAllReports,
  getReportById,
  updateReportStatus
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

// Gets a single report document from Firestore by its ID.
router.get('/getAllReports', getAllReports);

// Gets a single report document from Firestore by its ID.
router.get('/getReport/:id', getReportById);

// Updates the status of a single report document in Firestore.
router.post('/updateReport/:id', updateReportStatus);

export default router;

