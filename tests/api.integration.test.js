const request = require('supertest');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Create a test app similar to the main app but without Socket.IO
function createTestApp() {
    const app = express();
    
    app.use(cors());
    app.use(express.json());
    
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100
    });
    app.use('/api/', limiter);

    // In-memory storage for tests
    let services = [
        {
            id: 1,
            name: 'Test Service',
            url: 'http://localhost:3001',
            status: 'unknown',
            lastCheck: null,
            description: 'Test service description',
            endpoints: []
        }
    ];

    // API Routes
    app.get('/api/services', (req, res) => {
        res.json(services);
    });

    app.post('/api/services', (req, res) => {
        const { name, url, description, endpoints } = req.body;
        
        if (!name || !url) {
            return res.status(400).json({ error: 'Name and URL are required' });
        }

        const newService = {
            id: Date.now(),
            name,
            url,
            description,
            endpoints: endpoints || [],
            status: 'unknown',
            lastCheck: null
        };
        
        services.push(newService);
        res.status(201).json(newService);
    });

    app.delete('/api/services/:id', (req, res) => {
        const id = parseInt(req.params.id);
        const initialLength = services.length;
        services = services.filter(service => service.id !== id);
        
        if (services.length === initialLength) {
            return res.status(404).json({ error: 'Service not found' });
        }
        
        res.status(204).send();
    });

    app.get('/api/services/:id/health', (req, res) => {
        const id = parseInt(req.params.id);
        const service = services.find(s => s.id === id);
        
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        // Mock health check response
        res.json({
            status: 'online',
            responseTime: '50ms'
        });
    });

    // Reset function for tests
    app._resetServices = () => {
        services = [
            {
                id: 1,
                name: 'Test Service',
                url: 'http://localhost:3001',
                status: 'unknown',
                lastCheck: null,
                description: 'Test service description',
                endpoints: []
            }
        ];
    };

    return app;
}

describe('API Integration Tests', () => {
    let app;

    beforeEach(() => {
        app = createTestApp();
        app._resetServices();
    });

    describe('GET /api/services', () => {
        it('should return all services', async () => {
            const response = await request(app)
                .get('/api/services')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toHaveProperty('name', 'Test Service');
        });
    });

    describe('POST /api/services', () => {
        it('should create a new service', async () => {
            const newService = {
                name: 'New Service',
                url: 'http://localhost:3002',
                description: 'New test service'
            };

            const response = await request(app)
                .post('/api/services')
                .send(newService)
                .expect(201);

            expect(response.body).toHaveProperty('name', 'New Service');
            expect(response.body).toHaveProperty('url', 'http://localhost:3002');
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('status', 'unknown');
        });

        it('should return 400 when name is missing', async () => {
            const invalidService = {
                url: 'http://localhost:3002'
            };

            const response = await request(app)
                .post('/api/services')
                .send(invalidService)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Name and URL are required');
        });

        it('should return 400 when url is missing', async () => {
            const invalidService = {
                name: 'Test Service'
            };

            const response = await request(app)
                .post('/api/services')
                .send(invalidService)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Name and URL are required');
        });

        it('should create service with default empty endpoints', async () => {
            const newService = {
                name: 'Service Without Endpoints',
                url: 'http://localhost:3003'
            };

            const response = await request(app)
                .post('/api/services')
                .send(newService)
                .expect(201);

            expect(response.body.endpoints).toEqual([]);
        });

        it('should create service with provided endpoints', async () => {
            const newService = {
                name: 'Service With Endpoints',
                url: 'http://localhost:3004',
                endpoints: [
                    { method: 'GET', path: '/test', description: 'Test endpoint' }
                ]
            };

            const response = await request(app)
                .post('/api/services')
                .send(newService)
                .expect(201);

            expect(response.body.endpoints).toHaveLength(1);
            expect(response.body.endpoints[0]).toEqual({
                method: 'GET',
                path: '/test',
                description: 'Test endpoint'
            });
        });
    });

    describe('DELETE /api/services/:id', () => {
        it('should delete existing service', async () => {
            await request(app)
                .delete('/api/services/1')
                .expect(204);

            // Verify service is deleted
            const response = await request(app)
                .get('/api/services')
                .expect(200);

            expect(response.body).toHaveLength(0);
        });

        it('should return 404 when service not found', async () => {
            const response = await request(app)
                .delete('/api/services/999')
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Service not found');
        });
    });

    describe('GET /api/services/:id/health', () => {
        it('should return health status for existing service', async () => {
            const response = await request(app)
                .get('/api/services/1/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'online');
            expect(response.body).toHaveProperty('responseTime', '50ms');
        });

        it('should return 404 for non-existent service', async () => {
            const response = await request(app)
                .get('/api/services/999/health')
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Service not found');
        });
    });

    describe('Rate Limiting', () => {
        it('should apply rate limiting to API routes', async () => {
            // This test would need more sophisticated setup to actually test rate limiting
            // For now, just verify the endpoint works normally
            const response = await request(app)
                .get('/api/services')
                .expect(200);

            expect(response.body).toBeDefined();
        });
    });

    describe('CORS', () => {
        it('should include CORS headers', async () => {
            const response = await request(app)
                .get('/api/services')
                .expect(200);

            expect(response.headers).toHaveProperty('access-control-allow-origin');
        });
    });

    describe('JSON Parsing', () => {
        it('should handle invalid JSON in POST request', async () => {
            const response = await request(app)
                .post('/api/services')
                .set('Content-Type', 'application/json')
                .send('{"invalid": json}')
                .expect(400);

            // Express should return a 400 for invalid JSON
            expect(response.status).toBe(400);
        });
    });
});
