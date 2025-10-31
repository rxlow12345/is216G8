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
  getByGeoSpatial,
  deleteReport,
  getActiveSummary, 
} from '../controllers/reportController.js';

const router = express.Router();

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

// Gets summary details of report by reportId
router.get('/getReport/activeSummary/:id', getActiveSummary);

export default router;

