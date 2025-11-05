import { db, storage } from '../firebase.js'; // Storage is firebase cloud storage instance used for images and files
import { v4 as uuidv4 } from 'uuid'; // Generate random ID
import axios from 'axios';
import FormData from 'form-data';
// import { messaging } from 'firebase-admin';

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
    if (!storage) {
      throw new Error('Firebase Storage is not initialized. Please check Firebase configuration.');
    }
    
    const bucket = storage.bucket();
    if (!bucket) {
      throw new Error('Firebase Storage bucket is not available. Please check Firebase configuration.');
    }
    
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
      console.error('Firebase Storage error:', storageError);
      
      // Fallback Handling (if Upload Fails): Store as base64 in a separate collection if Storage fails
      try {
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
      } catch (fallbackError) {
        console.error('Fallback storage also failed:', fallbackError);
        res.status(500).json({
          success: false,
          message: 'Failed to upload image to Firebase Storage and fallback storage. Please check Firebase configuration.',
          error: process.env.NODE_ENV === 'development' ? storageError.message : 'Firebase Storage error'
        });
      }
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

// Helper function to format postal code with "S" prefix
const formatPostalCode = (postalCode) => {
  if (!postalCode) return null;
  
  const trimmed = String(postalCode).trim();
  
  // Remove existing "S" prefix if present (case-insensitive)
  const withoutPrefix = trimmed.replace(/^S/i, '');
  
  // Add "S" prefix
  return `S${withoutPrefix}`;
};

// getPostalCode - Extract postal code and English address using geocoding API
const getPostalCode = async (address) => {
  try {
    if (!address || address.trim() === '') {
      return null;
    }

    const apiKey = process.env.OPENCAGE_API_KEY || process.env.VITE_OPENCAGE_API_KEY || "9047284f3fca4d20a801c1c973198406";
    
    if (!apiKey) {
      console.error('OpenCage API key not found');
      return null;
    }

    // Force English language and prefer English results
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}&limit=1&countrycode=sg&language=en&no_annotations=1`;
    
    const response = await axios.get(url);
    
    if (response.data && response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      
      // Extract postal code from components
      // OpenCage API returns postal code in components.postcode or components.postal_code
      const components = result.components || {};
      const rawPostalCode = components.postcode || components.postal_code || components.postal || null;
      
      // Format postal code with "S" prefix
      const postalCode = formatPostalCode(rawPostalCode);
      
      // Get English formatted address (this is always in English due to language=en parameter)
      const englishAddress = result.formatted || address;
      
      return {
        postalCode: postalCode,
        englishAddress: englishAddress.trim()
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
};

// Create a new incident report
export const createReport = async (req, res) => {
  try {
    const {
      // Reporter Information
      reporterId, // Firebase user UID
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

    // Validate location first before geocoding
    if (!location || location.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Location is required'
      });
    }

    // Validate required fields
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Get postal code and English address from location (handles both English and Chinese input)
    let postalCode = null;
    let englishAddress = location.trim(); // Default to input address
    
    try {
      const geocodeResult = await getPostalCode(location);
      if (geocodeResult) {
        postalCode = geocodeResult.postalCode;
        englishAddress = geocodeResult.englishAddress; // Always use English address from API
      }
    } catch (geocodeError) {
      console.error('Error during geocoding:', geocodeError);
      // Continue to fallback extraction
    }
    
    // Fallback: Try to extract Singapore postal code (6 digits) from address string if geocoding didn't find it
    if (!postalCode) {
      // Try to match 6-digit postal code (may or may not have "S" prefix)
      const postalCodeMatch = location.match(/\b(S?)(\d{6})\b/i);
      if (postalCodeMatch) {
        // Extract the 6-digit code and format with "S" prefix
        const rawCode = postalCodeMatch[2]; // The 6 digits
        postalCode = formatPostalCode(rawCode);
      }
    }

    // Validate that postal code was found
    if (!postalCode) {
      return res.status(400).json({
        success: false, 
        message: "Unable to determine postal code for the provided location. Please ensure the location includes a valid Singapore address with postal code (6 digits), or include the postal code in the address field (e.g., '123 Orchard Road, Singapore 238890')."
      });
    }

    // Prepare report data
    const reportData = {
      // Reporter Information
      reporterId: reporterId || null, // Firebase user UID
      // reporterName: reporterName.trim(),
      // contactEmail: contactEmail.trim().toLowerCase(),
      // contactPhone: contactPhone?.trim() || null,
      
      // Incident Details
      incidentType,
      incidentTypeOther: incidentType === 'others' ? incidentTypeOther?.trim() : null,
      severity,
      description: description.trim(),
      location: {
        address: englishAddress, // Always use English address from geocoding API
        postalCode: postalCode
      },
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

    const newReport = { id: docRef.id, ...reportData };

    const io = req.app.get('io');
    if (io) {
      io.emit('new-report', newReport);
    }

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

// deleteReport
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if report exists first
    const docRef = db.collection('incidentReports').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Report not found' 
      });
    }
    
    // Delete the document
    await docRef.delete();
    
    // Broadcast deletion via WebSocket (if available)
    const io = req.app.get('io');
    if (io) {
      io.emit('report-deleted', docRef.id);
    }
    
    
    res.json({ 
      success: true,
      message: 'Report deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete report',
      error: error.message 
    });
  }
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
 * Gets a single report document from Firestore by its firebase ID.
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
 * Gets a single report document from Firestore by its custom reportId field.
 */
export const getReportByReportId = async (req, res) => {
  try {
    const { id } = req.params; // this will be the reportId value

    // Query for a document where reportId matches
    const reportsRef = db.collection('incidentReports');
    const snapshot = await reportsRef.where('reportId', '==', id).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Report not found: ' + id,
      });
    }

    // Get the first matching document
    const doc = snapshot.docs[0];
    const data = doc.data();

    res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Error fetching report by reportId:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve report',
    });
  }
};

/**
 * Gets the summary details when report is active
 */
export const getActiveSummary = async (req, res) => {
  try {
    const { id } = req.params; // this will be the reportId value

    // Query for a document where reportId matches
    const reportsRef = db.collection('activeStatusSummary');
    const snapshot = await reportsRef.where('reportId', '==', id).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Report not found: ' + id,
      });
    }

    // Get the first matching document
    const doc = snapshot.docs[0];
    const data = doc.data();

    res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Error fetching report by reportId:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve report',
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

    const updatedReport = { id: id, ...reportRef.data };

    const io = req.app.get('io');
    if (io) {
      io.emit('report-updated', updatedReport);
    }
    
    res.status(200).json({
      success: true,
      message: `Report ${id} status successfully updated to '${status}'`
    });

  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({
      success: false,
      message: `Failed to update report status: ${error.message}`
    });
  }
};

/**
 * Updates one or more fields of a single report document in Firestore.
 */
export const updateReportFields = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // Expects a JSON body like { "status": "in-progress", "priority": "high" }

    // Validate that there is at least one field to update
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided in the request body'
      });
    }

    const reportRef = db.collection('incidentReports').doc(id);

    // Add updatedAt timestamp automatically
    updates.updatedAt = new Date();

    // Perform the update
    await reportRef.update(updates);

    // Fetch updated document data (optional)
    const updatedDoc = await reportRef.get();
    const updatedReport = { id: updatedDoc.id, ...updatedDoc.data() };

    // Emit the update event if using Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('report-updated', updatedReport);
    }

    res.status(200).json({
      success: true,
      message: `Report ${id} successfully updated`,
      data: updatedReport
    });

  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report'
    });
  }
};

/**
 * Gets the email of the user who reported the case
 */
export const getUserEmail = async (req, res) => {
  try {
    const { id } = req.params; // this will be the reportId value

    const reportSnap = await db
      .collection('incidentReports')
      .where('reportId', '==', id)
      .limit(1)
      .get();

    if (reportSnap.empty) {
      return res.status(404).json({
        success: false,
        message: `Report not found: ${id}`,
      });
    }

    const reportData = reportSnap.docs[0].data();
    const { reporterId } = reportData;

    if (!reporterId) {
      return res.status(400).json({
        success: false,
        message: 'No UID found in the report data.',
      });
    }

    const userRef = db.collection('users').doc(reporterId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: `User not found for UID: ${reporterId}`,
      });
    }

    const userData = userDoc.data();
    const email = userData?.email;

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found for user.',
      });
    }

    res.status(200).json({
      success: true,
      email,
    });
  } catch (error) {
    console.error('Error fetching user email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user email.',
    });
  }
};
