import { db, storage } from '../firebase.js'; // Storage is firebase cloud storage instance used for images and files
import { v4 as uuidv4 } from 'uuid'; // Generate random ID
import axios from 'axios';
import FormData from 'form-data';

// SpeciesNet API configuration - using the working remote API
const SPECIESNET_API_URL = process.env.SPECIESNET_API_URL || 'http://34.126.93.66:8000';
// Call SpeciesNet API for species identification
export const identifySpecies = async (req, res) => {
  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    // Convert base64 to buffer for SpeciesNet API
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    try {
      // Call SpeciesNet API with FormData
      const formData = new FormData();
      formData.append('file', buffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });
      
      const response = await axios.post(`${SPECIESNET_API_URL}/predict`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000 // 60 second timeout (SpeciesNet takes ~25-30 seconds)
      });
      
      // Parse the real SpeciesNet API response format
      const predictions = response.data.predictions;
      let formattedPredictions = {};
      
      if (predictions && predictions.predictions && predictions.predictions.length > 0) {
        // Convert the real API format to our expected format
        const pred = predictions.predictions[0];
        
        // Extract species name from the prediction string
        // Format: "uuid;class;order;family;genus;species;common_name"
        // We want the common_name (last part after splitting by ';')
        const predictionParts = pred.prediction.split(';');
        const speciesName = predictionParts.length > 0 ? predictionParts[predictionParts.length - 1] : 'Unknown';
        const confidence = pred.prediction_score;
        
        // Check if we have a meaningful species identification
        // If the species name is empty, generic, or very low confidence, treat as unidentified
        const isGenericOrEmpty = !speciesName || 
                                speciesName.trim() === '' || 
                                speciesName.toLowerCase() === 'unknown' ||
                                speciesName.toLowerCase() === 'animal' ||
                                speciesName.toLowerCase() === 'mammal' ||
                                speciesName.toLowerCase() === 'blank' ||
                                confidence < 0.3; // Less than 30% confidence
        
        if (isGenericOrEmpty) {
          // Return a special indicator that no specific species was identified
          formattedPredictions = {
            "image.jpg": [
              {
                "class_name": null, // No specific species identified
                "confidence": confidence,
                "unidentified": true,
                "message": "No specific species could be identified. Please enter the species name manually."
              }
            ]
          };
        } else {
          formattedPredictions = {
            "image.jpg": [
              {
                "class_name": speciesName,
                "confidence": confidence
              }
            ]
          };
        }
      }
      
      res.json({
        success: true,
        data: {
          predictions: formattedPredictions,
          speciesIdentified: true
        }
      });
      
    } catch (apiError) {
      console.error('SpeciesNet API error:', apiError.message);
      
      // Return fallback response if SpeciesNet API is unavailable
      res.json({
        success: true,
        data: {
          predictions: null,
          speciesIdentified: false,
          message: 'Species identification service temporarily unavailable'
        }
      });
    }
    
  } catch (error) {
    console.error('Species identification error:', error);
    res.status(500).json({
      success: false,
      message: 'Species identification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Upload image to Firebase Storage and return download URL
export const uploadImage = async (req, res) => {
  try {
    const { imageData } = req.body; // base64 image data
    
    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    // Extract base64 data (remove data:image/jpeg;base64, prefix)
    // Convert remaining Base64 string into raw binary data (base64) ready for upload
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename
    const filename = `incident-images/${uuidv4()}.jpg`;
    
    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const file = bucket.file(filename);
    
    try {
      await file.save(buffer, {
        metadata: {
          contentType: 'image/jpeg',
          cacheControl: 'public, max-age=31536000'
        }
      });
      
      // Make file publicly accessible
      await file.makePublic();
      
      // Get download URL
      const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      
      
      res.json({
        success: true,
        data: {
          imageURL: downloadURL,
          filename: filename
        }
      });
      
    } catch (storageError) {
      
      // Fallback Handling (if Upload Fails): Store as base64 in a separate collection if Storage fails
      const fallbackId = uuidv4();
      await db.collection('imageFallback').doc(fallbackId).set({
        imageData: imageData,
        createdAt: new Date(),
        size: buffer.length
      });
      
      const fallbackURL = `${req.protocol}://${req.get('host')}/api/reports/images/${fallbackId}`;
      
      res.json({
        success: true,
        data: {
          imageURL: fallbackURL,
          filename: `fallback-${fallbackId}.jpg`,
          note: 'Stored as fallback due to Storage error'
        }
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Serve fallback images, if Firebase Storage upload fails, store Base64 image data inside imageFallback collection
export const getFallbackImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('imageFallback').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    const data = doc.data();
    const base64Data = data.imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000'
    });
    
    res.send(buffer);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve image'
    });
  }
};

// getByGeoSpatial,
export const getByGeoSpatial = async (req, res) => {
  try {
    // const { lat, lng, radius } = req.query;
    // const userLat = parseFloat(lat);
    // const userLng = parseFloat(lng);
    // const userRadius = parseFloat(radius); 
    // const snapshot = await db.collection("reports").get();



  } catch(error){

  }
};

// Create a new incident report
export const createReport = async (req, res) => {
  try {
    const {
      // Reporter Information
      // reporterName,
      // contactEmail,
      // contactPhone,
      
      // Incident Details
      incidentType,
      incidentTypeOther,
      severity,
      description,
      location,
      sightingDateTime,
      
      // Animal Identification
      speciesName,
      // animalCondition,
      
      // Reporter Assessment
      isMovingNormally,
      // isInDanger,
      // rescueCalled,
      // stayingOnSite,
      
      // Media (Firebase Storage URLs)
      photoURLs = []
    } = req.body;

    // Validate required fields
    // const requiredFields = [
    //   'reporterName', 'contactEmail', 'incidentType', 'severity', 
    //   'description', 'sightingDateTime', 'isMovingNormally', 
    //   'isInDanger', 'rescueCalled', 'stayingOnSite'
    // ];
      const requiredFields = [
      'incidentType', 'severity', 'sightingDateTime', 'description', 'isMovingNormally'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate location
    if (!location || location.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Location is required'
      });
    }

    // Prepare report data
    const reportData = {
      // Reporter Information
      // reporterName: reporterName.trim(),
      // contactEmail: contactEmail.trim().toLowerCase(),
      // contactPhone: contactPhone?.trim() || null,
      
      // Incident Details
      incidentType,
      incidentTypeOther: incidentType === 'others' ? incidentTypeOther?.trim() : null,
      severity,
      description: description.trim(),
      location: location.trim(),
      sightingDateTime: new Date(sightingDateTime),
      
      // Animal Identification
      speciesName: speciesName?.trim() || null,
      // animalCondition: animalCondition?.trim() || null,
      
      // Reporter Assessment
    
        isMovingNormally,
        // isInDanger,
        // stayingOnSite
      
      
    // Media (Firebase Storage URLs - no size limits needed)
    photoURLs: photoURLs.slice(0, 5), // Limit to 5 images max
    
    // Metadata
      status: 'pending', // pending, in-progress, resolved, closed
      // priority: calculatePriority(severity, isInDanger, rescueCalled),
      priority: calculatePriority(severity),
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Auto-generated fields
      reportId: generateReportId(),
      isUrgent: severity === 'urgent' 
      // || isInDanger === 'yes'
    };

    // Save to Firestore
    const docRef = await db.collection('incidentReports').add(reportData);


    // Send response
    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      reportId: docRef.id,
      data: {
        reportId: docRef.id,
        status: reportData.status,
        priority: reportData.priority,
        isUrgent: reportData.isUrgent,
        createdAt: reportData.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      // error: error.message
    });
  }
};

//   deleteReport,
export const deleteReport = async (req, res) => {
  try{
    const { id } = req.params;

    const doc = await db.collection('incidentReports').doc(id).get();
  } catch (error) {

  };
};

// Helper functions
// function calculatePriority(severity, isInDanger, rescueCalled) {
//   if (severity === 'urgent' || isInDanger === 'yes') {
//     return 'high';
//   } else if (severity === 'moderate') {
//     return 'medium';
//   } else if (rescueCalled === 'yes') {
//     return 'medium'; // Someone already called, but still needs follow-up
//   } else {
//     return 'low';
//   }
// }

function calculatePriority(severity) {
  if (severity === 'urgent') {
    return 'high';
  } else if (severity === 'moderate') {
    return 'medium';}
    else {
    return 'low';
  }
}

// Return time-based ID, WR (Wildlife Report), convert timestamp into base 36 (digits+letter)
function generateReportId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `WR-${timestamp}-${random}`.toUpperCase();
}

/**
 * Gets all report documents from the 'reports' collection in Firestore.
 */
export const getAllReports = async (req, res) => {
  try {
    // Get a reference to the 'reports' collection, ordering by creation date descending
    const reportsRef = db.collection('incidentReports').orderBy('createdAt', 'desc');
    const snapshot = await reportsRef.get();

    // The .map() function is a clean way to transform the snapshot documents
    // into an array of plain JavaScript objects.
    const reports = snapshot.docs.map(doc => ({
      id: doc.id, // Include the document ID
      ...doc.data() // Spread the rest of the document data
    }));
    
    // Send the array of reports back to the client
    res.status(200).json({
      success: true,
      data: reports
    });

  } catch (error) {
    console.error("Error fetching all reports:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports'
    });
  }
};

/**
 * Gets a single report document from Firestore by its ID.
 */
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Reference the document in the 'reports' collection
    const reportRef = db.collection('incidentReports').doc(id);
    const doc = await reportRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Send the document data back to the client
    res.status(200).json({
      success: true,
      data: doc.data()
    });

  } catch (error) {
    console.error("Error fetching report by ID:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve report'
    });
  }
};

/**
 * Updates the status of a single report document in Firestore.
 */
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects a JSON body like { "status": "in-progress" }

    // Basic validation to ensure a status was provided
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'A new status is required in the request body'
      });
    }

    const reportRef = db.collection('incidentReports').doc(id);

    // Update the status field and the updatedAt timestamp
    await reportRef.update({
      status: status,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: `Report ${id} status successfully updated to '${status}'`
    });

  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status'
    });
  }
};
