const express = require('express');
const router = express.Router();

// In-memory storage for demo (replace with database later)
let reports = [
  {
    id: 1,
    animalType: 'Cat',
    status: 'pending',
    location: { lat: 1.3521, lng: 103.8198 },
    address: 'Marina Bay, Singapore',
    reportedAt: new Date().toISOString(),
    description: 'Injured cat near MRT station',
    urgency: 'high',
    reporter: 'Sarah T.'
  },
  {
    id: 2,
    animalType: 'Dog',
    status: 'in-progress',
    location: { lat: 1.3644, lng: 103.9915 },
    address: 'Changi Beach, Singapore',
    reportedAt: new Date(Date.now() - 7200000).toISOString(),
    description: 'Stray dog with injured leg',
    urgency: 'medium',
    reporter: 'John L.',
    assignedTo: 'Volunteer Mike'
  }
];

let nextId = 3;

// GET all reports (with optional filters)
router.get('/', (req, res) => {
  try {
    const { status, urgency, lat, lng, radius } = req.query;
    
    let filteredReports = [...reports];

    // Filter by status
    if (status) {
      filteredReports = filteredReports.filter(r => r.status === status);
    }

    // Filter by urgency
    if (urgency) {
      filteredReports = filteredReports.filter(r => r.urgency === urgency);
    }

    // Filter by location (if coordinates provided)
    if (lat && lng && radius) {
      const centerLat = parseFloat(lat);
      const centerLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);

      filteredReports = filteredReports.filter(report => {
        const distance = calculateDistance(
          centerLat,
          centerLng,
          report.location.lat,
          report.location.lng
        );
        return distance <= maxRadius;
      });
    }

    res.json(filteredReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET single report by ID
router.get('/:id', (req, res) => {
  try {
    const report = reports.find(r => r.id === parseInt(req.params.id));
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// CREATE new report
router.post('/', (req, res) => {
  try {
    const { animalType, location, address, description, urgency, reporter } = req.body;

    // Validation
    if (!animalType || !location || !address || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields: animalType, location, address, description' 
      });
    }

    const newReport = {
      id: nextId++,
      animalType,
      status: 'pending',
      location,
      address,
      description,
      urgency: urgency || 'medium',
      reporter: reporter || 'Anonymous',
      reportedAt: new Date().toISOString()
    };

    reports.unshift(newReport); // Add to beginning

    // Broadcast to all connected clients via WebSocket
    const io = req.app.get('io');
    io.emit('new-report', newReport);

    console.log('📝 New report created:', newReport.id);
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// UPDATE report status
router.put('/:id/status', (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const { status, assignedTo } = req.body;

    const reportIndex = reports.findIndex(r => r.id === reportId);
    
    if (reportIndex === -1) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Update report
    reports[reportIndex].status = status;
    if (assignedTo) {
      reports[reportIndex].assignedTo = assignedTo;
    }
    if (status === 'resolved') {
      reports[reportIndex].resolvedAt = new Date().toISOString();
    }

    const updatedReport = reports[reportIndex];

    // Broadcast update
    const io = req.app.get('io');
    io.emit('report-updated', updatedReport);

    console.log('🔄 Report updated:', reportId);
    res.json(updatedReport);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// DELETE report
router.delete('/:id', (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const reportIndex = reports.findIndex(r => r.id === reportId);
    
    if (reportIndex === -1) {
      return res.status(404).json({ error: 'Report not found' });
    }

    reports.splice(reportIndex, 1);

    // Broadcast deletion
    const io = req.app.get('io');
    io.emit('report-deleted', reportId);

    console.log('🗑️ Report deleted:', reportId);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Helper function: Calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = router;