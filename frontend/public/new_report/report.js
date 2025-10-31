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

// Wraps the Geolocation API in a Promise.

// --- NEW CONCEPTUAL FUNCTION: Reverse Geocoding ---

const OPENCAGE_API_KEY = "9047284f3fca4d20a801c1c973198406";
const OPENCAGE_BASE_URL = "https://api.opencagedata.com/geocode/v1/json";

// Helper function (remains the same)
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
            return reject(new Error("Geolocation not supported."));
        }
        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => reject(error)
        );
    });
}

async function reverseGeocode(lat, lon) {
    // 1. Construct the URL with coordinates and API key
    // OpenCage uses the 'q' parameter with "latitude,longitude" format
    const url = `${OPENCAGE_BASE_URL}?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`OpenCage API request failed with status: ${response.status}`);
        }

        const data = await response.json();

        // 2. Check for successful results
        if (data.results && data.results.length > 0) {
            // OpenCage returns the most specific address in results[0].formatted
            return data.results[0].formatted;

        } else if (data.status.code === 402) {
            // Handle error codes like 402 (Quota exceeded)
            throw new Error("OpenCage quota exceeded or key invalid.");

        } else {
            // No results found
            return `No street address found for this location. (Lat: ${lat.toFixed(5)})`;
        }

    } catch (error) {
        console.error("Reverse Geocoding Error:", error);
        throw new Error("Failed to connect to the geocoding service.");
    }
}
/**
 * Creates and injects the Google Maps iframe centered on the given coordinates.
 */
let map = null; // Global variable for Leaflet map instance

function embedMap(lat, lon) {
    // 1. Get the current map container elements
    const mapContainer = document.getElementById('map-container');
    const osmMapDiv = document.getElementById('osm-map');

    // CRITICAL SAFETY CHECK: Ensure the main Leaflet div exists
    if (!osmMapDiv || !mapContainer) {
        console.error("Map container HTML elements not found!");
        return; // Exit the function if elements are missing
    }

    // 2. Clear previous map instance if it exists
    if (map) {
        map.remove();
        map = null;
    }

    // 3. Initialize the Leaflet Map
    map = L.map('osm-map').setView([lat, lon], 15);

    // 4. Add the OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 5. Add a marker
    L.marker([lat, lon]).addTo(map)
        .bindPopup("Your Location")
        .openPopup();

    // 6. Make Visible and Invalidate Size
    mapContainer.style.display = 'block';

    // Forces Leaflet to recalculate the container size, fixing blank map issues
    map.invalidateSize();
}

// output of the first lat and lon becomes the input for the second function

document.addEventListener('DOMContentLoaded', () => {
    const locationInput = document.getElementById('location');
    const locationBtn = document.getElementById('live-location-btn');
    const spinner = locationBtn.querySelector('.spinner-border');
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) mapContainer.style.display = 'none';

    locationBtn.addEventListener('click', async () => {
        spinner.style.display = 'inline-block';
        locationBtn.disabled = true;
        locationInput.placeholder = "Locating address...";
        locationInput.value = ""; // Clear old value

        try {
            // 1. Get the coordinates (AWAIT)
            const position = await getCurrentLocation();
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // 2. Reverse Geocode the coordinates (AWAIT)
            locationInput.placeholder = "Searching for street name...";

            // This line calls the OpenCage function defined above
            // crucial step to take the lat and lon variables successfully
            const address = await reverseGeocode(lat, lon);

            // 3. Fill the input with the readable address
            locationInput.value = address;
            if (typeof embedMap === 'function') {
                embedMap(lat, lon);
            }

        } catch (error) {
            let errorMessage = 'Unable to get location.';
            console.log("the full error is", error);
            if (error.message.includes('permission denied')) {
                errorMessage = 'Geolocation permission denied.';
            } else if (error.message.includes('OpenCage')) {
                errorMessage = error.message; // Use specific OpenCage error
            }

            alert(`Error: ${errorMessage}`);

        } finally {
            spinner.style.display = 'none';
            locationBtn.disabled = false;
            if (!locationInput.value) {
                locationInput.placeholder = "e.g., Marina Bay Sands...";
            }
        }
    });
});



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
        console.log(result);
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
                <div style="color: #000000ff; font-weight: bold; padding: 10px; border-radius: 4px; font-size: 14px;">
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

            // check if species was unidentified 
            if (topPrediction.unidentified) {
                speciesDetectionMessage.innerHTML = `
                    <div style="color: #000000ff; font-weight: bold; padding: 10px; border-radius: 4px; font-size: 14px;">
                        🔍 Species Identification Result:
                        <br><em>${topPrediction.message || 'Please enter the species name manually below.'}</em>
                        <br><small style="color: #2e2e2eff; font-weight: normal; margin-top: 5px; display: block;">
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
                <div style="color: #000000ff; font-weight: bold; padding: 10px; border-radius: 4px; font-size: 14px;">
                    🐾 Species Identification Result:
                    <br><span class="species-name"> ${speciesName}</span> (Confidence: ${confidence}%)
                    ${confidence >= 60 ? '<br><em>Species name automatically filled</em>' : '<br><em>Low confidence, please verify manually</em>'}
                </div>
            `;

            // Show additional predictions if available
            if (prediction.length > 1) {
                const additionalResults = prediction.slice(1, 4).map(p =>
                    `• ${p.class_name || p.species || 'Unknown'} (${Math.round((p.confidence || p.score || 0) * 100)}%)`
                ).join('<br>');

                speciesDetectionMessage.innerHTML += `
                    <div style="color: #000000ff; font-size: 12px; margin-top: 8px;">
                        Other possible species:<br>${additionalResults}
                    </div>
                `;
            }
        } else {
            speciesDetectionMessage.innerHTML = `
                <div style="color: #000000ff; font-weight: bold; padding: 10px; border-radius: 4px; font-size: 14px;">
                    ⚠️ Unable to identify species, please enter species name manually
                </div>
            `;
        }
    } else {
        speciesDetectionMessage.innerHTML = `
            <div style="color: #000000ff; font-weight: bold; padding: 10px; border-radius: 4px; font-size: 14px;">
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
    // submitBtn.textContent = 'Submitting...';
    // statusDiv.textContent = 'Submitting report...';

    try {
        // Collect form data
        const reportData = {
            // Reporter Information
            // reporterName: document.getElementById('reporterName').value,
            // contactEmail: document.getElementById('contactEmail').value,
            // contactPhone: document.getElementById('contactPhone').value,

            // Incident Details
            incidentType: document.getElementById('incidentType').value,
            incidentTypeOther: document.getElementById('incidentTypeOther').value,
            severity: document.getElementById('severity').value,
            description: document.getElementById('description').value,
            location: document.getElementById('location').value,
            sightingDateTime: document.getElementById('sightingDateTime').value,

            // Animal Identification
            speciesName: document.getElementById('speciesName').value,
            //animalCondition: document.getElementById('animalCondition').value,

            // Reporter Assessment
            isMovingNormally: document.querySelector('input[name="isMovingNormally"]:checked').value,
            // isInDanger: document.querySelector('input[name="isInDanger"]:checked').value,
            // rescueCalled: document.querySelector('input[name="rescueCalled"]:checked').value,
            // stayingOnSite: document.querySelector('input[name="stayingOnSite"]:checked').value
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
        const form = document.getElementById('reportForm');
        const modalEl = document.getElementById('submitSuccessModal');
        const modalStatus = document.getElementById('modalStatus');
        const modal = modalEl && typeof bootstrap !== 'undefined'
            ? new bootstrap.Modal(modalEl)
            : null;
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Server returned ${response.status}: ${text.substring(0, 200)}...`);
        }

        const result = await response.json();
        if (response.ok && result.success) {
            // statusDiv.innerHTML = `
            //     <div style="color: green; font-weight: bold;">
            //         ✅ Report submitted successfully!<br>
            //         Report ID: ${result.data.reportId}<br>
            //         Status: ${result.data.status}<br>
            //         Priority: ${result.data.priority}<br>
            //         <small>You will be contacted if further information is needed.</small>
            //     </div>
            // `;

            if (modal && modalStatus) {
                modalStatus.innerHTML = `
          <div class="fw-bold text-success">
            ✅ Report submitted successfully!<br>
            Report ID: ${result.data.reportId}<br>
            Status: ${result.data.status}<br>
            Priority: ${result.data.priority}<br>
            <small>You will be contacted if further information is needed.</small>
          </div>
        `;
                form.reset()
                modal.show();
            } else {
                throw new Error(result.message || 'Failed to submit report');
            }
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


// report.js

// <script>


document.addEventListener('DOMContentLoaded', function () {
    // --- Set current datetime ---
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    document.getElementById('sightingDateTime').value = localDateTime;

    // --- Handle form submission ---
    document.getElementById('reportForm').addEventListener('submit', submitReport);

    // --- Show/hide "Other" text input ---
    const incidentType = document.getElementById('incidentType');
    if (incidentType) {
        incidentType.addEventListener('change', function () {
            const otherInput = document.getElementById('incidentTypeOther');
            if (otherInput) {
                otherInput.style.display = this.value === 'others' ? 'block' : 'none';
            }
        });
    }

    // --- Handle photo file selection ---
    const photoInput = document.getElementById('photos');
    if (photoInput) {
        photoInput.addEventListener('change', async function (event) {
            const files = event.target.files;
            if (files.length === 0) return;
            const firstImageFile = Array.from(files).find(file => file.type.startsWith('image/'));
            if (!firstImageFile) return;

            const speciesDetectionMessage = document.getElementById('speciesDetectionMessage');
            let startTime = Date.now();

            speciesDetectionMessage.innerHTML = `
        <div style="color:#050000ff;font-weight:bold;padding:10px;border-radius:4px;font-size:16px;">
          🔍 Identifying species... This may take up to 30 seconds
          <br><small style="color:#000000ff;font-weight:normal;">Please wait while AI analyzes the image</small>
          <div id="progressTimer" style="margin-top:5px;font-size:12px;color:#000000ff;"></div>
        </div>
      `;

            const timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const timer = document.getElementById('progressTimer');
                if (timer) {
                    timer.textContent = `Processing time: ${elapsed} seconds`;
                }
            }, 1000);

            try {
                const predictions = await identifySpecies(firstImageFile);
                clearInterval(timerInterval);
                displaySpeciesResults(predictions);
            } catch (error) {
                clearInterval(timerInterval);
                console.error('Error identifying species:', error);
            }
        });
    }

    // --- Initialize stepper ---
    initStepper();
});


// --------------------------------------------
// Stepper logic — reusable function
// --------------------------------------------

function initStepper() {
    const form = document.getElementById('reportForm');
    const panes = Array.from(document.querySelectorAll('.step-pane'));
    const pills = Array.from(document.querySelectorAll('[data-step-pill]'));
    const progressBar = document.getElementById('progressBar');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if (!form || !pills.length || !panes.length || !progressBar || !nextBtn || !prevBtn) {
        console.warn('Stepper: required elements not found.');
        return;
    }

    let step = 1;
    const total = panes.length;

    function showStep(n) {
        step = Math.min(Math.max(1, n), total);

        panes.forEach(pane => {
            pane.classList.toggle('active', Number(pane.dataset.step) === step);
        });

        pills.forEach(pill => {
            const idx = Number(pill.dataset.stepPill || pill.dataset.step - pill);
            pill.classList.remove('active', 'done');
            if (idx < step) pill.classList.add('done');
            else if (idx === step) pill.classList.add('active');
        });

        // const pct = Math.round((step / total) * 100);
        let pct = Math.round(((step - 1) / total) * 100);
        if (pct < 0) pct = 0;

        progressBar.style.width = pct + '%';
        progressBar.textContent = pct + '%';

        prevBtn.disabled = step === 1;
        nextBtn.classList.toggle('d-none', step === total);
    }

    function validateCurrentStep() {
        const pane = panes.find(pane => Number(pane.dataset.step) === step);
        if (!pane) return true;

        const inputs = Array.from(pane.querySelectorAll('input, select, textarea'));
        let valid = true;
        inputs.forEach(el => {
            if (!el.checkValidity()) {
                el.classList.add('is-invalid');
                valid = false;
            } else {
                el.classList.remove('is-invalid');
            }
        });

        return valid;
    }


    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
            showStep(step + 1);
        } else {
            const invalid = panes.find(pane => Number(pane.dataset.step) === step)
                ?.querySelector('.is-invalid, :invalid');
            if (invalid) invalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    form.addEventListener('submit', async (e) => {
        const valid = validateCurrentStep();
        e.preventDefault();
        e.stopPropagation();
        // run your validator

        if (!valid) {
            e.preventDefault();
            e.stopPropagation();
            // Find the first invalid field in the current step
            const invalid = Array.from(panes)
                .find(pane => Number(pane.dataset.step) === step)
                ?.querySelector('.is-invalid, :invalid');

            if (invalid) {
                invalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                invalid.focus();
            }
        }
    });


    prevBtn.addEventListener('click', () => showStep(step - 1));

    form.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            if (step < total) nextBtn.click();
        }
    });

    showStep(step);

    // clicking anywhere on the calendar shows the calendar

    const datetimeInput = document.getElementById('sightingDateTime');

    // When user clicks anywhere on the input box, open the picker
    datetimeInput.addEventListener('click', (e) => {
        // Only open if browser supports it and it's not already open
        if (datetimeInput.showPicker) {
            datetimeInput.showPicker();
        }
    });
}
