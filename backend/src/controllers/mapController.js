import { db } from '../firebase.js'; // Storage is firebase cloud storage instance used for images and files

export const getByGeoSpatial = async (req, res) => {
  try {
    const { status, urgency, lat, lng, radius } = req.query;

    // Get a reference to the 'reports' collection, ordering by creation date descending
    // Get a reference to the 'reports' collection, ordering by creation date descending
    const reportsRef = db.collection('incidentReports').orderBy('createdAt', 'desc');
    const snapshot = await reportsRef.get();

    // The .map() function is a clean way to transform the snapshot documents
    // into an array of plain JavaScript objects.
    let reports = snapshot.docs.map(doc => ({
      id: doc.id, // Include the document ID
      ...doc.data() // Spread the rest of the document data
    }));

    // Filter by status
    if (status) {
      reports = reports.filter((r) => r.status === status);
    }

    // Filter by urgency
    if (urgency) {
      reports = reports.filter((r) => r.urgency === urgency);
    }

    // Filter by location (if coordinates provided)
    if (lat && lng && radius) {
      const centerLat = Number(lat);
      const centerLng = Number(lng);
      const maxRadius = Number(radius);

      reports = reports.filter((report) => {
        const distance = calculateDistance(
          centerLat,
          centerLng,
          Number(report.location.lat),
          Number(report.location.lng)
        );
        return distance <= maxRadius;
      });
    };
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

// Helper function: Calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
