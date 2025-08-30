const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

class DashboardTester {
    constructor() {
        this.token = null;
        this.testResults = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
        console.log(logEntry);
        this.testResults.push({ timestamp, type, message });
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async testEndpoint(method, endpoint, data = null, headers = {}) {
        try {
            const config = {
                method,
                url: `${BASE_URL}${endpoint}`,
                headers,
                timeout: 5000
            };

            if (data) {
                config.data = data;
            }

            const response = await axios(config);
            this.log(`✓ ${method.toUpperCase()} ${endpoint} - Status: ${response.status}`, 'success');
            return { success: true, status: response.status, data: response.data };
        } catch (error) {
            const status = error.response ? error.response.status : 'NO_RESPONSE';
            const message = error.response ? error.response.data : error.message;
            this.log(`✗ ${method.toUpperCase()} ${endpoint} - Status: ${status}, Error: ${message}`, 'error');
            return { success: false, status, error: message };
        }
    }

    async testAuthentication() {
        this.log('=== Testing Authentication ===');
        
        // Test login with admin credentials
        const loginResult = await this.testEndpoint('POST', '/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });

        if (loginResult.success && loginResult.data.token) {
            this.token = loginResult.data.token;
            this.log('✓ Admin login successful, token received', 'success');
            
            // Test accessing protected endpoint
            const protectedResult = await this.testEndpoint('GET', '/api/analytics', null, {
                'Authorization': `Bearer ${this.token}`
            });
            
            if (protectedResult.success) {
                this.log('✓ Protected endpoint accessible with token', 'success');
            }
            
            // Test logout
            const logoutResult = await this.testEndpoint('POST', '/api/auth/logout', null, {
                'Authorization': `Bearer ${this.token}`
            });
            
            if (logoutResult.success) {
                this.log('✓ Logout successful', 'success');
            }
        }

        // Test login with user credentials
        const userLoginResult = await this.testEndpoint('POST', '/api/auth/login', {
            username: 'user',
            password: 'user123'
        });

        if (userLoginResult.success) {
            this.log('✓ User login successful', 'success');
        }

        // Test invalid credentials
        const invalidLoginResult = await this.testEndpoint('POST', '/api/auth/login', {
            username: 'invalid',
            password: 'invalid'
        });

        if (!invalidLoginResult.success && invalidLoginResult.status === 401) {
            this.log('✓ Invalid credentials properly rejected', 'success');
        }
    }

    async testPublicEndpoints() {
        this.log('=== Testing Public Endpoints ===');
        
        const endpoints = [
            { method: 'GET', path: '/health' },
            { method: 'GET', path: '/api/services' },
            { method: 'GET', path: '/api/health' }
        ];

        for (const endpoint of endpoints) {
            await this.testEndpoint(endpoint.method, endpoint.path);
        }
    }

    async testMicroservices() {
        this.log('=== Testing Microservices ===');
        
        const services = [
            { name: 'User Service', url: 'http://localhost:3001/users' },
            { name: 'Product Service', url: 'http://localhost:3002/products' },
            { name: 'Order Service', url: 'http://localhost:3003/orders' }
        ];

        for (const service of services) {
            try {
                const response = await axios.get(service.url, { timeout: 3000 });
                this.log(`✓ ${service.name} is running - Status: ${response.status}`, 'success');
            } catch (error) {
                this.log(`✗ ${service.name} is not responding: ${error.message}`, 'error');
            }
        }
    }

    async testApiTester() {
        this.log('=== Testing API Tester Functionality ===');
        
        // Test the API tester endpoint
        const testData = {
            url: 'http://localhost:3001/users',
            method: 'GET',
            headers: {},
            body: ''
        };

        const result = await this.testEndpoint('POST', '/api/test-request', testData);
        if (result.success) {
            this.log('✓ API tester endpoint working', 'success');
        }
    }

    async testPerformanceAnalytics() {
        this.log('=== Testing Performance Analytics ===');
        
        if (!this.token) {
            // Get a token first
            const loginResult = await this.testEndpoint('POST', '/api/auth/login', {
                username: 'admin',
                password: 'admin123'
            });
            
            if (loginResult.success) {
                this.token = loginResult.data.token;
            }
        }

        if (this.token) {
            const analyticsResult = await this.testEndpoint('GET', '/api/analytics', null, {
                'Authorization': `Bearer ${this.token}`
            });
            
            if (analyticsResult.success) {
                this.log('✓ Analytics endpoint accessible', 'success');
                
                // Check if analytics data has the expected structure
                const data = analyticsResult.data;
                if (data.requestCount !== undefined && data.responseTime !== undefined) {
                    this.log('✓ Analytics data structure is correct', 'success');
                } else {
                    this.log('✗ Analytics data structure is incomplete', 'warning');
                }
            }
        }
    }

    async runAllTests() {
        this.log('Starting Dashboard Tests...', 'info');
        this.log('=================================', 'info');

        // Wait a moment for services to start
        await this.sleep(2000);

        await this.testPublicEndpoints();
        await this.testAuthentication();
        await this.testMicroservices();
        await this.testApiTester();
        await this.testPerformanceAnalytics();

        this.log('=================================', 'info');
        this.log('Dashboard Tests Complete!', 'info');
        
        // Summary
        const successful = this.testResults.filter(r => r.type === 'success').length;
        const errors = this.testResults.filter(r => r.type === 'error').length;
        const warnings = this.testResults.filter(r => r.type === 'warning').length;
        
        this.log(`Summary: ${successful} successful, ${errors} errors, ${warnings} warnings`, 'info');

        return {
            total: this.testResults.length,
            successful,
            errors,
            warnings,
            results: this.testResults
        };
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new DashboardTester();
    
    tester.runAllTests()
        .then(summary => {
            console.log('\n=== FINAL SUMMARY ===');
            console.log(`Total tests: ${summary.total}`);
            console.log(`Successful: ${summary.successful}`);
            console.log(`Errors: ${summary.errors}`);
            console.log(`Warnings: ${summary.warnings}`);
            
            if (summary.errors > 0) {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Test runner failed:', error);
            process.exit(1);
        });
}

module.exports = DashboardTester;
