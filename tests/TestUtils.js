// Test utilities and helpers
const request = require('supertest');
const { spawn } = require('child_process');

class TestUtils {
    /**
     * Start a service process for testing
     * @param {string} servicePath - Path to the service file
     * @param {number} port - Port to run the service on
     * @param {number} delay - Delay before considering service started
     * @returns {Promise<ChildProcess>} The spawned process
     */
    static async startService(servicePath, port, delay = 2000) {
        return new Promise((resolve) => {
            const service = spawn('node', [servicePath], {
                env: { ...process.env, PORT: port },
                stdio: ['ignore', 'pipe', 'pipe']
            });

            setTimeout(() => {
                resolve(service);
            }, delay);
        });
    }

    /**
     * Stop a service process
     * @param {ChildProcess} service - The service process to stop
     * @param {number} delay - Delay after killing the process
     * @returns {Promise<void>}
     */
    static async stopService(service, delay = 1000) {
        return new Promise((resolve) => {
            if (service) {
                service.kill();
                setTimeout(resolve, delay);
            } else {
                resolve();
            }
        });
    }

    /**
     * Wait for a service to be ready
     * @param {string} url - The service URL
     * @param {number} maxAttempts - Maximum number of attempts
     * @param {number} delay - Delay between attempts
     * @returns {Promise<boolean>} True if service is ready
     */
    static async waitForService(url, maxAttempts = 10, delay = 1000) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const response = await request(url).get('/health');
                if (response.status === 200) {
                    return true;
                }
            } catch (error) {
                // Service not ready yet
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        return false;
    }

    /**
     * Create a test user
     * @param {string} baseUrl - Service base URL
     * @param {object} userData - User data
     * @returns {Promise<object>} Created user
     */
    static async createTestUser(baseUrl, userData = {}) {
        const defaultData = {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+1234567890'
        };

        const response = await request(baseUrl)
            .post('/api/users')
            .send({ ...defaultData, ...userData });

        return response.body;
    }

    /**
     * Create a test product
     * @param {string} baseUrl - Service base URL
     * @param {object} productData - Product data
     * @returns {Promise<object>} Created product
     */
    static async createTestProduct(baseUrl, productData = {}) {
        const defaultData = {
            name: 'Test Product',
            price: 99.99,
            category: 'Test'
        };

        const response = await request(baseUrl)
            .post('/api/products')
            .send({ ...defaultData, ...productData });

        return response.body;
    }

    /**
     * Create a test order
     * @param {string} baseUrl - Service base URL
     * @param {object} orderData - Order data
     * @returns {Promise<object>} Created order
     */
    static async createTestOrder(baseUrl, orderData = {}) {
        const defaultData = {
            userId: 1,
            items: [{ productId: 1, quantity: 1, price: 99.99 }],
            total: 99.99
        };

        const response = await request(baseUrl)
            .post('/api/orders')
            .send({ ...defaultData, ...orderData });

        return response.body;
    }

    /**
     * Generate random test data
     * @param {string} type - Type of data to generate
     * @returns {object} Generated data
     */
    static generateTestData(type) {
        const random = Math.random().toString(36).substr(2, 9);
        
        switch (type) {
            case 'user':
                return {
                    name: `Test User ${random}`,
                    email: `test${random}@example.com`,
                    phone: `+123456${Math.floor(Math.random() * 10000)}`
                };
            
            case 'product':
                return {
                    name: `Test Product ${random}`,
                    price: Math.floor(Math.random() * 1000) + 1,
                    category: ['Electronics', 'Books', 'Clothing', 'Home'][Math.floor(Math.random() * 4)]
                };
            
            case 'order':
                return {
                    userId: Math.floor(Math.random() * 100) + 1,
                    items: [{
                        productId: Math.floor(Math.random() * 100) + 1,
                        quantity: Math.floor(Math.random() * 5) + 1,
                        price: Math.floor(Math.random() * 100) + 1
                    }],
                    total: Math.floor(Math.random() * 500) + 1
                };
            
            default:
                return {};
        }
    }

    /**
     * Clean up test data
     * @param {string} baseUrl - Service base URL
     * @param {string} endpoint - Endpoint to clean
     * @param {Array} ids - IDs to clean up
     * @returns {Promise<void>}
     */
    static async cleanupTestData(baseUrl, endpoint, ids) {
        const deletePromises = ids.map(id => 
            request(baseUrl)
                .delete(`${endpoint}/${id}`)
                .catch(() => {}) // Ignore errors for cleanup
        );
        
        await Promise.all(deletePromises);
    }

    /**
     * Measure execution time of a function
     * @param {Function} fn - Function to measure
     * @returns {Promise<{result: any, duration: number}>}
     */
    static async measureExecutionTime(fn) {
        const start = Date.now();
        const result = await fn();
        const duration = Date.now() - start;
        return { result, duration };
    }

    /**
     * Retry a function until it succeeds or max attempts reached
     * @param {Function} fn - Function to retry
     * @param {number} maxAttempts - Maximum attempts
     * @param {number} delay - Delay between attempts
     * @returns {Promise<any>} Function result
     */
    static async retry(fn, maxAttempts = 3, delay = 1000) {
        let lastError;
        
        for (let i = 0; i < maxAttempts; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                if (i < maxAttempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Mock WebSocket for testing
     * @returns {object} Mock WebSocket
     */
    static createMockWebSocket() {
        return {
            send: jest.fn(),
            close: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            readyState: 1,
            onopen: null,
            onmessage: null,
            onerror: null,
            onclose: null
        };
    }

    /**
     * Create a mock fetch function
     * @param {object} mockResponse - Mock response data
     * @returns {Function} Mock fetch function
     */
    static createMockFetch(mockResponse = {}) {
        return jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockResponse,
            text: async () => JSON.stringify(mockResponse),
            ...mockResponse
        });
    }

    /**
     * Validate API response structure
     * @param {object} response - Response to validate
     * @param {object} expectedStructure - Expected structure
     * @returns {boolean} True if valid
     */
    static validateResponseStructure(response, expectedStructure) {
        for (const key in expectedStructure) {
            if (expectedStructure.hasOwnProperty(key)) {
                if (!response.hasOwnProperty(key)) {
                    return false;
                }
                
                const expectedType = expectedStructure[key];
                const actualValue = response[key];
                
                if (expectedType === 'string' && typeof actualValue !== 'string') {
                    return false;
                }
                if (expectedType === 'number' && typeof actualValue !== 'number') {
                    return false;
                }
                if (expectedType === 'array' && !Array.isArray(actualValue)) {
                    return false;
                }
                if (expectedType === 'object' && typeof actualValue !== 'object') {
                    return false;
                }
            }
        }
        return true;
    }
}

module.exports = TestUtils;
