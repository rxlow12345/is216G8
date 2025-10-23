/**
 * TestSprite Test Runner for Wildlife Incident Report System
 * This script can be run with TestSprite.com or locally
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class TestSpriteRunner {
    constructor() {
        this.results = [];
        this.baseUrl = 'http://localhost:5175';
        this.apiBaseUrl = 'http://localhost:4100/api';
        this.testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    }

    async runTest(name, testFunction) {
        console.log(`🧪 Running test: ${name}`);
        const startTime = Date.now();
        
        try {
            const result = await testFunction();
            const duration = Date.now() - startTime;
            
            this.results.push({
                name,
                status: 'PASS',
                duration,
                result
            });
            
            console.log(`✅ PASSED: ${name} (${duration}ms)`);
            return result;
            
        } catch (error) {
            const duration = Date.now() - startTime;
            
            this.results.push({
                name,
                status: 'FAIL',
                duration,
                error: error.message
            });
            
            console.log(`❌ FAILED: ${name} (${duration}ms) - ${error.message}`);
            throw error;
        }
    }

    async testBackendHealth() {
        const response = await axios.get(`${this.apiBaseUrl}/health`);
        
        if (response.status !== 200) {
            throw new Error(`Expected status 200, got ${response.status}`);
        }
        
        if (response.data.status !== 'OK') {
            throw new Error('Backend health check failed');
        }
        
        return response.data;
    }

    async testImageUpload() {
        const response = await axios.post(`${this.apiBaseUrl}/reports/upload-image`, {
            imageData: this.testImage
        });
        
        if (response.status !== 200) {
            throw new Error(`Image upload failed with status ${response.status}`);
        }
        
        if (!response.data.success) {
            throw new Error(`Image upload failed: ${response.data.message}`);
        }
        
        if (!response.data.data.imageURL) {
            throw new Error('No image URL returned');
        }
        
        return response.data;
    }

    async testReportCreation() {
        const reportData = {
            reporterName: 'TestSprite User',
            contactEmail: 'test@testsprite.com',
            contactPhone: '+1234567890',
            incidentType: 'injured',
            severity: 'moderate',
            description: 'TestSprite automated test - wildlife incident report',
            location: 'TestSprite Testing Ground, Singapore',
            sightingDateTime: new Date().toISOString().slice(0, 16),
            speciesName: 'Test Animal',
            animalCondition: 'Testing automated report submission',
            isMovingNormally: 'no',
            isInDanger: 'yes',
            rescueCalled: 'no',
            stayingOnSite: 'yes'
        };
        
        const response = await axios.post(`${this.apiBaseUrl}/reports`, reportData);
        
        if (response.status !== 201) {
            throw new Error(`Report creation failed with status ${response.status}`);
        }
        
        if (!response.data.success) {
            throw new Error(`Report creation failed: ${response.data.message}`);
        }
        
        if (!response.data.reportId) {
            throw new Error('No report ID returned');
        }
        
        return response.data;
    }

    async testReportWithImage() {
        // First upload an image
        const uploadResponse = await axios.post(`${this.apiBaseUrl}/reports/upload-image`, {
            imageData: this.testImage
        });
        
        const imageURL = uploadResponse.data.data.imageURL;
        
        // Create report with image
        const reportData = {
            reporterName: 'TestSprite User with Image',
            contactEmail: 'test@testsprite.com',
            contactPhone: '+1234567890',
            incidentType: 'injured',
            severity: 'urgent',
            description: 'TestSprite test with image upload',
            location: 'TestSprite Testing Ground, Singapore',
            sightingDateTime: new Date().toISOString().slice(0, 16),
            speciesName: 'Test Animal with Photo',
            animalCondition: 'Testing image upload functionality',
            isMovingNormally: 'no',
            isInDanger: 'yes',
            rescueCalled: 'no',
            stayingOnSite: 'yes',
            photoURLs: [imageURL]
        };
        
        const response = await axios.post(`${this.apiBaseUrl}/reports`, reportData);
        
        if (response.status !== 201) {
            throw new Error(`Report with image creation failed with status ${response.status}`);
        }
        
        if (!response.data.success) {
            throw new Error(`Report with image creation failed: ${response.data.message}`);
        }
        
        return response.data;
    }

    async testReportRetrieval() {
        const response = await axios.get(`${this.apiBaseUrl}/reports`);
        
        if (response.status !== 200) {
            throw new Error(`Report retrieval failed with status ${response.status}`);
        }
        
        // Handle both direct array response and wrapped response
        let reports;
        if (response.data.success && response.data.data) {
            reports = response.data.data;
        } else if (Array.isArray(response.data)) {
            reports = response.data;
        } else {
            throw new Error('Unexpected response format for reports');
        }
        
        if (!Array.isArray(reports)) {
            throw new Error('Reports should be an array');
        }
        
        return reports;
    }

    async testReportStats() {
        const response = await axios.get(`${this.apiBaseUrl}/reports/stats`);
        
        if (response.status !== 200) {
            throw new Error(`Statistics retrieval failed with status ${response.status}`);
        }
        
        return response.data;
    }

    async testErrorHandling() {
        try {
            await axios.post(`${this.apiBaseUrl}/reports`, {
                // Invalid data - missing required fields
                reporterName: '',
                contactEmail: 'invalid-email'
            });
            
            throw new Error('Expected error response for invalid data');
            
        } catch (error) {
            if (error.response && error.response.status === 400) {
                return { status: 'error_handled_correctly' };
            }
            throw new Error(`Unexpected error: ${error.message}`);
        }
    }

    async testImageUploadError() {
        try {
            await axios.post(`${this.apiBaseUrl}/reports/upload-image`, {
                // Missing imageData
                invalidField: 'test'
            });
            
            throw new Error('Expected error response for missing image data');
            
        } catch (error) {
            if (error.response && error.response.status === 400) {
                return { status: 'error_handled_correctly' };
            }
            throw new Error(`Unexpected error: ${error.message}`);
        }
    }

    async runAllTests() {
        console.log('🚀 Starting TestSprite Test Suite for Wildlife Incident Report System');
        console.log('='.repeat(70));
        
        const tests = [
            ['Backend Health Check', () => this.testBackendHealth()],
            ['Image Upload Test', () => this.testImageUpload()],
            ['Report Creation (No Image)', () => this.testReportCreation()],
            ['Report Creation (With Image)', () => this.testReportWithImage()],
            ['Report Retrieval', () => this.testReportRetrieval()],
            ['Report Statistics', () => this.testReportStats()],
            ['Error Handling - Invalid Report', () => this.testErrorHandling()],
            ['Error Handling - Invalid Image Upload', () => this.testImageUploadError()]
        ];
        
        for (const [name, testFunction] of tests) {
            await this.runTest(name, testFunction);
        }
        
        this.generateReport();
    }

    generateReport() {
        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.status === 'PASS').length;
        const failedTests = this.results.filter(r => r.status === 'FAIL').length;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 TESTSPRITE TEST RESULTS');
        console.log('='.repeat(70));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${passedTests}`);
        console.log(`❌ Failed: ${failedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log(`Total Duration: ${this.results.reduce((sum, r) => sum + r.duration, 0)}ms`);
        
        if (failedTests === 0) {
            console.log('\n🎉 ALL TESTS PASSED! Wildlife Incident Report System is working correctly.');
        } else {
            console.log('\n⚠️  Some tests failed. Check the details above.');
            console.log('\nFailed Tests:');
            this.results.filter(r => r.status === 'FAIL').forEach(r => {
                console.log(`  - ${r.name}: ${r.error}`);
            });
        }
        
        // Generate HTML report
        this.generateHTMLReport();
        
        console.log('\n📄 Detailed report saved to: testsprite-results.html');
    }

    generateHTMLReport() {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>TestSprite Results - Wildlife Incident Report System</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 3px; }
        .pass { background: #d4edda; border-left: 4px solid #28a745; }
        .fail { background: #f8d7da; border-left: 4px solid #dc3545; }
        .summary { background: #e2e3e5; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🐾 TestSprite Results</h1>
        <h2>Wildlife Incident Report System</h2>
        <p>Generated: ${new Date().toISOString()}</p>
    </div>
    
    <div class="summary">
        <h3>Test Summary</h3>
        <p><strong>Total Tests:</strong> ${this.results.length}</p>
        <p><strong>Passed:</strong> ${this.results.filter(r => r.status === 'PASS').length}</p>
        <p><strong>Failed:</strong> ${this.results.filter(r => r.status === 'FAIL').length}</p>
        <p><strong>Success Rate:</strong> ${((this.results.filter(r => r.status === 'PASS').length / this.results.length) * 100).toFixed(1)}%</p>
    </div>
    
    <h3>Test Results</h3>
    ${this.results.map(r => `
        <div class="test-result ${r.status.toLowerCase()}">
            <strong>${r.name}</strong> - ${r.status} (${r.duration}ms)
            ${r.error ? `<br><em>Error: ${r.error}</em>` : ''}
        </div>
    `).join('')}
</body>
</html>`;
        
        fs.writeFileSync('testsprite-results.html', html);
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    const runner = new TestSpriteRunner();
    runner.runAllTests().catch(error => {
        console.error('Test suite failed:', error);
        process.exit(1);
    });
}

module.exports = TestSpriteRunner;
