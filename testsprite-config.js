/**
 * TestSprite Configuration for Wildlife Incident Report System
 * Compatible with TestSprite.com automated testing framework
 */

// TestSprite test configuration
const testSpriteConfig = {
    name: "Wildlife Incident Report System Tests",
    description: "Automated tests for wildlife incident reporting with image upload functionality",
    baseUrl: "http://localhost:5175",
    apiBaseUrl: "http://localhost:4100/api",
    
    // Test scenarios
    scenarios: [
        {
            name: "Backend Health Check",
            type: "api",
            endpoint: "/health",
            method: "GET",
            expectedStatus: 200,
            expectedResponse: {
                status: "OK",
                message: "Critter Connect API is running"
            }
        },
        
        {
            name: "Report Page Load",
            type: "ui",
            url: "/pages/report.html",
            actions: [
                {
                    type: "waitForElement",
                    selector: "h1",
                    timeout: 5000
                },
                {
                    type: "assertText",
                    selector: "h1",
                    expectedText: "🐾 Wildlife Incident Report"
                }
            ]
        },
        
        {
            name: "Form Validation - Required Fields",
            type: "ui",
            url: "/pages/report.html",
            actions: [
                {
                    type: "click",
                    selector: "#submitBtn"
                },
                {
                    type: "waitForElement",
                    selector: ".status",
                    timeout: 3000
                },
                {
                    type: "assertText",
                    selector: ".status",
                    contains: "Error"
                }
            ]
        },
        
        {
            name: "Image Upload Test",
            type: "api",
            endpoint: "/reports/upload-image",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            },
            expectedStatus: 200,
            expectedResponse: {
                success: true,
                data: {
                    imageURL: /.+/,
                    filename: /.+/
                }
            }
        },
        
        {
            name: "Complete Report Submission",
            type: "ui",
            url: "/pages/report.html",
            actions: [
                // Fill reporter information
                {
                    type: "fill",
                    selector: "#reporterName",
                    value: "TestSprite User"
                },
                {
                    type: "fill",
                    selector: "#contactEmail",
                    value: "test@testsprite.com"
                },
                {
                    type: "fill",
                    selector: "#contactPhone",
                    value: "+1234567890"
                },
                
                // Fill incident details
                {
                    type: "select",
                    selector: "#incidentType",
                    value: "injured"
                },
                {
                    type: "select",
                    selector: "#severity",
                    value: "moderate"
                },
                {
                    type: "fill",
                    selector: "#description",
                    value: "TestSprite automated test - wildlife incident report"
                },
                {
                    type: "fill",
                    selector: "#location",
                    value: "TestSprite Testing Ground, Singapore"
                },
                {
                    type: "fill",
                    selector: "#sightingDateTime",
                    value: new Date().toISOString().slice(0, 16)
                },
                
                // Fill animal identification
                {
                    type: "fill",
                    selector: "#speciesName",
                    value: "Test Animal"
                },
                {
                    type: "fill",
                    selector: "#animalCondition",
                    value: "Testing automated report submission"
                },
                
                // Fill assessment
                {
                    type: "click",
                    selector: "input[name='isMovingNormally'][value='no']"
                },
                {
                    type: "click",
                    selector: "input[name='isInDanger'][value='yes']"
                },
                {
                    type: "click",
                    selector: "input[name='rescueCalled'][value='no']"
                },
                {
                    type: "click",
                    selector: "input[name='stayingOnSite'][value='yes']"
                },
                
                // Submit form
                {
                    type: "click",
                    selector: "#submitBtn"
                },
                
                // Wait for success response
                {
                    type: "waitForElement",
                    selector: ".status",
                    timeout: 10000
                },
                {
                    type: "assertText",
                    selector: ".status",
                    contains: "successfully"
                }
            ]
        },
        
        {
            name: "Report Retrieval API",
            type: "api",
            endpoint: "/reports",
            method: "GET",
            expectedStatus: 200,
            expectedResponse: {
                // Should return an array of reports
                type: "array"
            }
        },
        
        {
            name: "Report Statistics API",
            type: "api",
            endpoint: "/reports/stats",
            method: "GET",
            expectedStatus: 200,
            expectedResponse: {
                // Should return statistics object
                type: "object"
            }
        },
        
        {
            name: "Image Upload with Large File",
            type: "api",
            endpoint: "/reports/upload-image",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                // Simulate larger image data
                imageData: "data:image/jpeg;base64," + "A".repeat(50000)
            },
            expectedStatus: 200,
            expectedResponse: {
                success: true,
                data: {
                    imageURL: /.+/,
                    filename: /.+/
                }
            }
        },
        
        {
            name: "Error Handling - Invalid Image Upload",
            type: "api",
            endpoint: "/reports/upload-image",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                // Missing imageData
                invalidField: "test"
            },
            expectedStatus: 400,
            expectedResponse: {
                success: false,
                message: /.+/
            }
        },
        
        {
            name: "Error Handling - Invalid Report Data",
            type: "api",
            endpoint: "/reports",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                // Missing required fields
                reporterName: "",
                contactEmail: "invalid-email"
            },
            expectedStatus: 400,
            expectedResponse: {
                success: false,
                message: /.+/
            }
        }
    ],
    
    // Performance tests
    performance: {
        scenarios: [
            {
                name: "Page Load Performance",
                url: "/pages/report.html",
                maxLoadTime: 3000, // 3 seconds
                checks: [
                    {
                        type: "loadTime",
                        max: 3000
                    },
                    {
                        type: "resourceCount",
                        max: 20
                    }
                ]
            },
            {
                name: "Image Upload Performance",
                endpoint: "/reports/upload-image",
                method: "POST",
                maxResponseTime: 5000, // 5 seconds
                body: {
                    imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                }
            }
        ]
    },
    
    // Browser compatibility
    browsers: [
        "chrome",
        "firefox",
        "safari",
        "edge"
    ],
    
    // Test environment setup
    setup: {
        beforeAll: [
            {
                type: "api",
                endpoint: "/health",
                method: "GET",
                description: "Verify backend is running"
            }
        ],
        afterAll: [
            {
                type: "log",
                message: "TestSprite testing completed for Wildlife Incident Report System"
            }
        ]
    },
    
    // Test data
    testData: {
        validReport: {
            reporterName: "TestSprite User",
            contactEmail: "test@testsprite.com",
            contactPhone: "+1234567890",
            incidentType: "injured",
            severity: "moderate",
            description: "TestSprite automated test - wildlife incident report",
            location: "TestSprite Testing Ground, Singapore",
            sightingDateTime: new Date().toISOString().slice(0, 16),
            speciesName: "Test Animal",
            animalCondition: "Testing automated report submission",
            isMovingNormally: "no",
            isInDanger: "yes",
            rescueCalled: "no",
            stayingOnSite: "yes"
        },
        testImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    }
};

// Export for TestSprite
if (typeof module !== 'undefined' && module.exports) {
    module.exports = testSpriteConfig;
} else if (typeof window !== 'undefined') {
    window.testSpriteConfig = testSpriteConfig;
}

// TestSprite CLI configuration
const testSpriteCLI = {
    config: "testsprite-config.js",
    environment: "development",
    parallel: true,
    retries: 2,
    timeout: 30000,
    report: {
        format: "html",
        output: "testsprite-report.html"
    }
};

console.log("🧪 TestSprite configuration loaded for Wildlife Incident Report System");
console.log("📋 Test scenarios configured:");
console.log("   - Backend Health Check");
console.log("   - Report Page Load");
console.log("   - Form Validation");
console.log("   - Image Upload Tests");
console.log("   - Complete Report Submission");
console.log("   - API Endpoint Tests");
console.log("   - Error Handling Tests");
console.log("   - Performance Tests");
console.log("");
console.log("🚀 To run tests with TestSprite:");
console.log("   1. Upload this config to TestSprite.com");
console.log("   2. Ensure your servers are running:");
console.log("      - Frontend: http://localhost:5175");
console.log("      - Backend: http://localhost:4100");
console.log("   3. Run the test suite");

