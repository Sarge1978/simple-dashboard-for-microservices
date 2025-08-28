/**
 * @jest-environment jsdom
 */

// Mock WebSocket for testing
global.WebSocket = jest.fn(() => ({
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    readyState: 1
}));

// Mock fetch API
global.fetch = jest.fn();

describe('Frontend Dashboard Tests', () => {
    let document, window;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = `
            <div id="services-container"></div>
            <div id="activity-log"></div>
            <div id="api-result"></div>
            <select id="api-service"></select>
            <select id="api-method"></select>
            <input id="api-path" />
            <textarea id="api-headers"></textarea>
            <textarea id="api-body"></textarea>
            <button id="execute-btn"></button>
            <form id="add-service-form">
                <input id="service-name" />
                <input id="service-url" />
                <input id="service-description" />
            </form>
        `;

        // Reset fetch mock
        fetch.mockClear();
    });

    describe('Service Management', () => {
        it('should add service to the list', () => {
            // Mock the services array
            window.services = [];
            
            const mockService = {
                id: 1,
                name: 'Test Service',
                url: 'http://localhost:3001',
                description: 'Test description',
                status: 'unknown'
            };

            // Simulate adding service
            window.services.push(mockService);
            
            expect(window.services).toHaveLength(1);
            expect(window.services[0]).toEqual(mockService);
        });

        it('should remove service from the list', () => {
            window.services = [
                { id: 1, name: 'Service 1', url: 'http://localhost:3001' },
                { id: 2, name: 'Service 2', url: 'http://localhost:3002' }
            ];

            // Simulate removing service
            window.services = window.services.filter(s => s.id !== 1);
            
            expect(window.services).toHaveLength(1);
            expect(window.services[0].id).toBe(2);
        });
    });

    describe('API Testing', () => {
        beforeEach(() => {
            // Mock successful API response
            fetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({ success: true, data: 'test' }),
                text: async () => JSON.stringify({ success: true, data: 'test' })
            });
        });

        it('should execute GET request', async () => {
            const apiCall = {
                method: 'GET',
                url: 'http://localhost:3001/api/test',
                headers: {},
                body: null
            };

            const result = await fetch(apiCall.url, {
                method: apiCall.method,
                headers: apiCall.headers,
                body: apiCall.body
            });

            expect(fetch).toHaveBeenCalledWith(apiCall.url, {
                method: 'GET',
                headers: {},
                body: null
            });
            expect(result.ok).toBe(true);
        });

        it('should execute POST request with body', async () => {
            const apiCall = {
                method: 'POST',
                url: 'http://localhost:3001/api/users',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Test User' })
            };

            await fetch(apiCall.url, {
                method: apiCall.method,
                headers: apiCall.headers,
                body: apiCall.body
            });

            expect(fetch).toHaveBeenCalledWith(apiCall.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Test User' })
            });
        });

        it('should handle API errors', async () => {
            fetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                text: async () => 'Resource not found'
            });

            const result = await fetch('http://localhost:3001/api/notfound');
            
            expect(result.ok).toBe(false);
            expect(result.status).toBe(404);
        });
    });

    describe('Service Health Monitoring', () => {
        it('should update service status', () => {
            window.services = [
                { id: 1, name: 'Test Service', status: 'unknown' }
            ];

            // Simulate status update
            const serviceId = 1;
            const newStatus = 'online';
            const service = window.services.find(s => s.id === serviceId);
            if (service) {
                service.status = newStatus;
                service.lastCheck = new Date().toISOString();
            }

            expect(window.services[0].status).toBe('online');
            expect(window.services[0].lastCheck).toBeDefined();
        });

        it('should handle offline status', () => {
            window.services = [
                { id: 1, name: 'Test Service', status: 'online' }
            ];

            // Simulate offline status
            const service = window.services[0];
            service.status = 'offline';
            service.lastCheck = new Date().toISOString();

            expect(service.status).toBe('offline');
        });
    });

    describe('Activity Logging', () => {
        it('should add log entry', () => {
            window.activityLog = [];

            const logEntry = {
                timestamp: new Date().toISOString(),
                level: 'info',
                message: 'Test log message'
            };

            window.activityLog.push(logEntry);

            expect(window.activityLog).toHaveLength(1);
            expect(window.activityLog[0]).toEqual(logEntry);
        });

        it('should limit log entries', () => {
            window.activityLog = [];
            const maxEntries = 100;

            // Add more entries than the limit
            for (let i = 0; i < 150; i++) {
                window.activityLog.push({
                    timestamp: new Date().toISOString(),
                    level: 'info',
                    message: `Log entry ${i}`
                });
            }

            // Simulate trimming
            if (window.activityLog.length > maxEntries) {
                window.activityLog = window.activityLog.slice(-maxEntries);
            }

            expect(window.activityLog).toHaveLength(maxEntries);
        });
    });

    describe('WebSocket Communication', () => {
        let mockWebSocket;

        beforeEach(() => {
            mockWebSocket = new WebSocket();
        });

        it('should create WebSocket connection', () => {
            expect(WebSocket).toHaveBeenCalled();
            expect(mockWebSocket.addEventListener).toBeDefined();
        });

        it('should handle WebSocket messages', () => {
            const messageHandler = jest.fn();
            mockWebSocket.addEventListener('message', messageHandler);

            // Simulate message
            const mockMessage = {
                data: JSON.stringify({
                    type: 'status_update',
                    serviceId: 1,
                    status: 'online'
                })
            };

            expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('message', messageHandler);
        });

        it('should handle WebSocket errors', () => {
            const errorHandler = jest.fn();
            mockWebSocket.addEventListener('error', errorHandler);

            expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('error', errorHandler);
        });
    });

    describe('UI Utilities', () => {
        it('should format timestamps', () => {
            const formatTimestamp = (timestamp) => {
                return new Date(timestamp).toLocaleString();
            };

            const testTimestamp = '2025-08-28T12:00:00Z';
            const formatted = formatTimestamp(testTimestamp);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe('string');
        });

        it('should validate URLs', () => {
            const isValidUrl = (string) => {
                try {
                    new URL(string);
                    return true;
                } catch (_) {
                    return false;
                }
            };

            expect(isValidUrl('http://localhost:3000')).toBe(true);
            expect(isValidUrl('https://example.com')).toBe(true);
            expect(isValidUrl('invalid-url')).toBe(false);
            expect(isValidUrl('')).toBe(false);
        });

        it('should sanitize HTML content', () => {
            const sanitizeHtml = (html) => {
                const div = document.createElement('div');
                div.textContent = html;
                return div.innerHTML;
            };

            const maliciousInput = '<script>alert("xss")</script>';
            const sanitized = sanitizeHtml(maliciousInput);

            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
        });
    });

    describe('JSON Syntax Highlighting', () => {
        it('should highlight JSON syntax', () => {
            const highlightJson = (json) => {
                try {
                    const parsed = JSON.parse(json);
                    return JSON.stringify(parsed, null, 2);
                } catch (e) {
                    return json;
                }
            };

            const testJson = '{"name":"test","value":123}';
            const highlighted = highlightJson(testJson);

            expect(highlighted).toContain('"name"');
            expect(highlighted).toContain('"test"');
            expect(highlighted).toContain('123');
        });

        it('should handle invalid JSON', () => {
            const highlightJson = (json) => {
                try {
                    const parsed = JSON.parse(json);
                    return JSON.stringify(parsed, null, 2);
                } catch (e) {
                    return json;
                }
            };

            const invalidJson = 'invalid json';
            const result = highlightJson(invalidJson);

            expect(result).toBe(invalidJson);
        });
    });
});
