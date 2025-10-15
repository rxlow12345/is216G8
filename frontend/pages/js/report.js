// Backend API configuration, automatically detect environment
// if in production, frontend and backend would host together whereas development would separate
// Check if we are running the app locally (on our own computer)
const isDevelopment =
  window.location.hostname === 'localhost' ||   
  window.location.hostname === '127.0.0.1';     

// If we are in development (local testing):
// → use the backend that runs on port 4100 (your Express server)
// Otherwise (in production):
// → use the same domain as the website
const API_BASE_URL = isDevelopment
  ? `${window.location.protocol}//${window.location.hostname}:4100/api`
  : '/api';

// Example results:
// When testing locally:  "http://localhost:4100/api"
// When online (production):  "/api"

// SpeciesNet API configuration
const SPECIESNET_API_URL = isDevelopment 
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'https://speciesnet-api-url.com'; // Production URL

// Compress image before upload, Firestore doesn't allow to store large file
function compressImage(file, maxWidth = 600, quality = 0.5) {
    return new Promise((resolve) => {
        // create canvas to draw image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;
            if (width > maxWidth) {
                height = (height * maxWidth) / width; // Same ratio
                width = maxWidth;
            }
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Check if still too large and compress more if needed
        const sizeKB = Math.round(compressedDataUrl.length / 1024);
        if (sizeKB > 500) {
            // Try with even lower quality
            const moreCompressed = canvas.toDataURL('image/jpeg', 0.3);
            resolve(moreCompressed);
        } else {
            resolve(compressedDataUrl);
        }
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// Upload file to Firebase Storage and return URL
async function uploadFile(file) {
    // Only compress images, keep other files as is
    if (file.type.startsWith('image/')) {
        const statusDiv = document.getElementById('status');
        statusDiv.innerHTML = `
            <div style="color: #2196F3; font-weight: bold; background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 10px 0;">
                Compressing and uploading image to cloud storage...
            </div>
        `;
        
        const compressedImage = await compressImage(file);
        
        // Upload to Firebase Storage
        try {
            const response = await fetch(`${API_BASE_URL}/reports/upload-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageData: compressedImage
                })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                statusDiv.innerHTML = ''; // Clear message after upload
                return result.data.imageURL; // Return the Firebase Storage URL
            } else {
                throw new Error(result.message || 'Failed to upload image');
            }
        } catch (error) {
            statusDiv.innerHTML = `
                <div style="color: #f44336; font-weight: bold; background: #ffebee; padding: 15px; border-radius: 4px; margin: 10px 0;">
                    Failed to upload image: ${error.message}
                </div>
            `;
            throw error;
        }
    } else {
        // For non-image files, convert to base64 as before
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Species identification using backend API (which calls SpeciesNet)
async function identifySpecies(imageFile) {
    try {
        // Convert image file to base64
        const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
        
        const response = await fetch(`${API_BASE_URL}/reports/identify-species`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageData: base64Data
            })
        });
        
        if (!response.ok) {
            throw new Error(`Backend API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            return result.data.predictions;
        } else {
            throw new Error(result.message || 'Species identification failed');
        }
        
    } catch (error) {
        console.error('Species identification failed:', error);
        // Show timeout-specific error message
        const speciesDetectionMessage = document.getElementById('speciesDetectionMessage');
        if (error.message.includes('timeout') || error.message.includes('Network Error')) {
            speciesDetectionMessage.innerHTML = `
                <div style="color: #ff9800; font-weight: bold; background: #fff3e0; padding: 10px; border-radius: 4px; font-size: 14px;">
                    ⏱️ Species identification is taking longer than expected. Please try again or enter species name manually.
                </div>
            `;
        }
        return null;
    }
}

// Display species identification results
function displaySpeciesResults(predictions) {
    const speciesNameInput = document.getElementById('speciesName');
    const speciesDetectionMessage = document.getElementById('speciesDetectionMessage');
    
    if (predictions && Object.keys(predictions).length > 0) {
        // Get the first prediction result
        const firstKey = Object.keys(predictions)[0];
        const prediction = predictions[firstKey];
        
        if (prediction && prediction.length > 0) {
            const topPrediction = prediction[0];
            
            // Check if species was unidentified
            if (topPrediction.unidentified) {
                speciesDetectionMessage.innerHTML = `
                    <div style="color: #ff9800; font-weight: bold; background: #fff3e0; padding: 10px; border-radius: 4px; font-size: 14px;">
                        🔍 Species Identification Result:
                        <br><strong>No specific species identified</strong>
                        <br><em>${topPrediction.message || 'Please enter the species name manually below.'}</em>
                        <br><small style="color: #666; font-weight: normal; margin-top: 5px; display: block;">
                            💡 Tip: You can enter common names like "Hornbill", "Wild Boar", "Palm Civet", etc.
                        </small>
                    </div>
                `;
                
                // Focus on the species name input to encourage manual entry
                speciesNameInput.focus();
                speciesNameInput.placeholder = "Enter species name (e.g., Hornbill, Wild Boar, Palm Civet)";
                return;
            }
            
            const speciesName = topPrediction.class_name || topPrediction.species || 'Unknown';
            const confidence = Math.round((topPrediction.confidence || topPrediction.score || 0) * 100);
            
            // Auto-fill species name if confidence is high enough
            if (confidence >= 60 && !speciesNameInput.value) {
                speciesNameInput.value = speciesName;
            }
            
            // Show identification results
            speciesDetectionMessage.innerHTML = `
                <div style="color: #4caf50; font-weight: bold; background: #e8f5e8; padding: 10px; border-radius: 4px; font-size: 14px;">
                    🐾 Species Identification Result:
                    <br><strong>${speciesName}</strong> (Confidence: ${confidence}%)
                    ${confidence >= 60 ? '<br><em>Species name automatically filled</em>' : '<br><em>Low confidence, please verify manually</em>'}
                </div>
            `;
            
            // Show additional predictions if available
            if (prediction.length > 1) {
                const additionalResults = prediction.slice(1, 4).map(p => 
                    `• ${p.class_name || p.species || 'Unknown'} (${Math.round((p.confidence || p.score || 0) * 100)}%)`
                ).join('<br>');
                
                speciesDetectionMessage.innerHTML += `
                    <div style="color: #666; font-size: 12px; margin-top: 8px;">
                        Other possible species:<br>${additionalResults}
                    </div>
                `;
            }
        } else {
            speciesDetectionMessage.innerHTML = `
                <div style="color: #ff9800; font-weight: bold; background: #fff3e0; padding: 10px; border-radius: 4px; font-size: 14px;">
                    ⚠️ Unable to identify species, please enter species name manually
                </div>
            `;
        }
    } else {
        speciesDetectionMessage.innerHTML = `
            <div style="color: #ff9800; font-weight: bold; background: #fff3e0; padding: 10px; border-radius: 4px; font-size: 14px;">
                ⚠️ Species identification service temporarily unavailable, please enter species name manually
            </div>
        `;
    }
}



// Submit report to backend API
async function submitReport(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const statusDiv = document.getElementById('status');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    statusDiv.textContent = 'Submitting report...';

    try {
        // Collect form data
        const reportData = {
            // Reporter Information
            reporterName: document.getElementById('reporterName').value,
            contactEmail: document.getElementById('contactEmail').value,
            contactPhone: document.getElementById('contactPhone').value,
            
            // Incident Details
            incidentType: document.getElementById('incidentType').value,
            incidentTypeOther: document.getElementById('incidentTypeOther').value,
            severity: document.getElementById('severity').value,
            description: document.getElementById('description').value,
            location: document.getElementById('location').value,
            sightingDateTime: document.getElementById('sightingDateTime').value,
            
            // Animal Identification
            speciesName: document.getElementById('speciesName').value,
            animalCondition: document.getElementById('animalCondition').value,
            
            // Reporter Assessment
            isMovingNormally: document.querySelector('input[name="isMovingNormally"]:checked').value,
            isInDanger: document.querySelector('input[name="isInDanger"]:checked').value,
            rescueCalled: document.querySelector('input[name="rescueCalled"]:checked').value,
            stayingOnSite: document.querySelector('input[name="stayingOnSite"]:checked').value
        };

        // Handle file uploads
        const photoFiles = document.getElementById('photos').files;
        const uploadedPhotoURLs = [];
        
        if (photoFiles.length > 0) {
            statusDiv.innerHTML = `
                <div style="color: #2196F3; font-weight: bold; background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 10px 0;">
                    Uploading ${photoFiles.length} file(s) to cloud storage...
                </div>
            `;
            
            for (let i = 0; i < photoFiles.length; i++) {
                const file = photoFiles[i];
                if (file.type.startsWith('image/')) {
                    statusDiv.innerHTML = `
                        <div style="color: #2196F3; font-weight: bold; background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 10px 0;">
                            Uploading image ${i + 1} of ${photoFiles.length}...
                        </div>
                    `;
                } else {
                    statusDiv.innerHTML = `
                        <div style="color: #2196F3; font-weight: bold; background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 10px 0;">
                            Processing file ${i + 1} of ${photoFiles.length}...
                        </div>
                    `;
                }
                
                const url = await uploadFile(file);
                uploadedPhotoURLs.push(url);
            }
        }
        reportData.photoURLs = uploadedPhotoURLs;


        // Submit to backend API
        const response = await fetch(`${API_BASE_URL}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData)
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Server returned ${response.status}: ${text.substring(0, 200)}...`);
        }

        const result = await response.json();

        if (response.ok && result.success) {
            statusDiv.innerHTML = `
                <div style="color: green; font-weight: bold;">
                    ✅ Report submitted successfully!<br>
                    Report ID: ${result.data.reportId}<br>
                    Status: ${result.data.status}<br>
                    Priority: ${result.data.priority}<br>
                    <small>You will be contacted if further information is needed.</small>
                </div>
            `;
            
            // Reset form
            document.getElementById('reportForm').reset();
        } else {
            throw new Error(result.message || 'Failed to submit report');
        }
        
        } catch (error) {
        statusDiv.innerHTML = `
            <div style="color: red; font-weight: bold;">
                ❌ Error submitting report: ${error.message}<br>
                Please check your connection and try again, or contact support.
            </div>
        `;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Report';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Set current datetime
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('sightingDateTime').value = localDateTime;
    
    // Handle form submission
    document.getElementById('reportForm').addEventListener('submit', submitReport);
    
    // Show/hide "Other" text input based on incident type
    document.getElementById('incidentType').addEventListener('change', function() {
        const otherInput = document.getElementById('incidentTypeOther');
        otherInput.style.display = this.value === 'others' ? 'block' : 'none';
    });
    
    // Handle photo file selection for species identification
    document.getElementById('photos').addEventListener('change', async function(event) {
        const files = event.target.files;
        if (files.length > 0) {
            const firstImageFile = Array.from(files).find(file => file.type.startsWith('image/'));
            if (firstImageFile) {
                // Show identification status in the dedicated message area
                const speciesDetectionMessage = document.getElementById('speciesDetectionMessage');
                let startTime = Date.now();
                
                // Show initial message
                speciesDetectionMessage.innerHTML = `
                    <div style="color: #2196F3; font-weight: bold; background: #e3f2fd; padding: 10px; border-radius: 4px; font-size: 14px;">
                        🔍 Identifying species... This may take up to 30 seconds
                        <br><small style="color: #666; font-weight: normal;">Please wait while AI analyzes the image</small>
                        <div id="progressTimer" style="margin-top: 5px; font-size: 12px; color: #666;"></div>
                    </div>
                `;
                
                // Start progress timer
                const timerInterval = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - startTime) / 1000);
                    const progressTimer = document.getElementById('progressTimer');
                    if (progressTimer) {
                        progressTimer.textContent = `Processing time: ${elapsed} seconds`;
                    }
                }, 1000);
                
                try {
                    // Run species identification
                    const predictions = await identifySpecies(firstImageFile);
                    clearInterval(timerInterval);
                    displaySpeciesResults(predictions);
                } catch (error) {
                    clearInterval(timerInterval);
                    throw error;
                }
            }
        }
    });
    
    
});

