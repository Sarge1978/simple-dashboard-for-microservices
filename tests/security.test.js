const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');

describe('Security and Performance Tests', () => {
    let app;

    beforeEach(() => {
        app = express();
        // Don't set up express.json() here - let individual tests configure it
    });

    describe('Rate Limiting', () => {
        it('should limit requests when rate limit is exceeded', async () => {
            const limiter = rateLimit({
                windowMs: 1000, // 1 second
                max: 2, // limit each IP to 2 requests per windowMs
                message: 'Too many requests'
            });

            app.use('/api/', limiter);
            app.get('/api/test', (req, res) => {
                res.json({ success: true });
            });

            // First two requests should succeed
            await request(app).get('/api/test').expect(200);
            await request(app).get('/api/test').expect(200);

            // Third request should be rate limited
            await request(app).get('/api/test').expect(429);
        });
    });

    describe('Input Validation', () => {
        beforeEach(() => {
            app.use(express.json());
            app.post('/api/service', (req, res) => {
                const { name, url, description } = req.body;

                // Basic validation
                if (!name || typeof name !== 'string' || name.length > 100) {
                    return res.status(400).json({ error: 'Invalid name' });
                }

                if (!url || typeof url !== 'string') {
                    return res.status(400).json({ error: 'Invalid URL' });
                }

                try {
                    new URL(url);
                } catch (e) {
                    return res.status(400).json({ error: 'Invalid URL format' });
                }

                if (description && typeof description !== 'string') {
                    return res.status(400).json({ error: 'Invalid description' });
                }

                res.status(201).json({ name, url, description });
            });
        });

        it('should reject requests with missing required fields', async () => {
            await request(app)
                .post('/api/service')
                .send({})
                .expect(400);
        });

        it('should reject requests with invalid data types', async () => {
            await request(app)
                .post('/api/service')
                .send({ name: 123, url: 'http://test.com' })
                .expect(400);
        });

        it('should reject requests with invalid URLs', async () => {
            await request(app)
                .post('/api/service')
                .send({ name: 'Test', url: 'not-a-url' })
                .expect(400);
        });

        it('should reject requests with oversized data', async () => {
            const longName = 'a'.repeat(101);
            await request(app)
                .post('/api/service')
                .send({ name: longName, url: 'http://test.com' })
                .expect(400);
        });

        it('should accept valid requests', async () => {
            await request(app)
                .post('/api/service')
                .send({
                    name: 'Test Service',
                    url: 'http://localhost:3001',
                    description: 'A test service'
                })
                .expect(201);
        });
    });

    describe('XSS Protection', () => {
        beforeEach(() => {
            app.use(express.json());
            app.post('/api/log', (req, res) => {
                const { message } = req.body;

                // Simple XSS protection
                const sanitizedMessage = message
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');

                res.json({ message: sanitizedMessage });
            });
        });

        it('should sanitize HTML tags in input', async () => {
            const maliciousInput = '<script>alert("xss")</script>';
            const response = await request(app)
                .post('/api/log')
                .send({ message: maliciousInput })
                .expect(200);

            expect(response.body.message).not.toContain('<script>');
            expect(response.body.message).toContain('&lt;script&gt;');
        });
    });

    describe('JSON Parsing Security', () => {
        it('should handle malformed JSON gracefully', async () => {
            app.use(express.json());
            app.use((error, req, res, next) => {
                if (error instanceof SyntaxError && error.status === 400) {
                    return res.status(400).json({ error: 'Invalid JSON' });
                }
                next(error);
            });

            app.post('/api/test', (req, res) => {
                res.json({ success: true });
            });

            await request(app)
                .post('/api/test')
                .send('invalid json')
                .set('Content-Type', 'application/json')
                .expect(400);
        });
    });

    describe('Performance Tests', () => {
        it('should handle multiple concurrent requests', async () => {
            app.get('/api/fast', (req, res) => {
                res.json({ timestamp: Date.now() });
            });

            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(request(app).get('/api/fast'));
            }

            const results = await Promise.all(promises);
            results.forEach(result => {
                expect(result.status).toBe(200);
            });
        });

        it('should respond within acceptable time limits', async () => {
            app.get('/api/timed', (req, res) => {
                // Simulate some processing
                setTimeout(() => {
                    res.json({ processed: true });
                }, 10);
            });

            const start = Date.now();
            await request(app).get('/api/timed').expect(200);
            const duration = Date.now() - start;

            expect(duration).toBeLessThan(1000); // Should respond within 1 second
        });
    });

    describe('Memory and Resource Management', () => {
        it('should handle large request bodies efficiently', async () => {
            app.use(express.json({ limit: '1mb' }));
            app.post('/api/large', (req, res) => {
                res.json({ size: JSON.stringify(req.body).length });
            });

            const largeData = {
                data: 'x'.repeat(500000) // 500KB of data
            };

            const response = await request(app)
                .post('/api/large')
                .send(largeData)
                .expect(200);

            expect(response.body.size).toBeGreaterThan(500000);
        });

        it('should reject oversized request bodies', async () => {
            app.use(express.json({ limit: '100kb' }));
            
            app.use((error, req, res, next) => {
                if (error.type === 'entity.too.large') {
                    return res.status(413).json({ error: 'Request entity too large' });
                }
                next(error);
            });

            app.post('/api/small', (req, res) => {
                res.json({ success: true });
            });

            const oversizedData = {
                data: 'x'.repeat(200000) // 200KB of data
            };

            await request(app)
                .post('/api/small')
                .send(oversizedData)
                .expect(413);
        });
    });

    describe('Error Handling', () => {
        it('should not expose internal errors', async () => {
            app.get('/api/error', (req, res, next) => {
                const error = new Error('Internal database error with sensitive info');
                error.stack = 'Error: database password is 12345...';
                next(error);
            });

            app.use((error, req, res, next) => {
                // Don't expose internal error details
                res.status(500).json({
                    error: 'Internal server error',
                    message: 'An error occurred processing your request'
                });
            });

            const response = await request(app)
                .get('/api/error')
                .expect(500);

            expect(response.body.error).toBe('Internal server error');
            expect(response.body.message).not.toContain('database');
            expect(response.body.message).not.toContain('password');
        });
    });

    describe('Headers Security', () => {
        it('should not expose sensitive headers', async () => {
            app.get('/api/secure', (req, res) => {
                // Remove sensitive headers
                res.removeHeader('X-Powered-By');
                res.setHeader('X-Content-Type-Options', 'nosniff');
                res.setHeader('X-Frame-Options', 'DENY');
                res.json({ secure: true });
            });

            const response = await request(app)
                .get('/api/secure')
                .expect(200);

            expect(response.headers['x-powered-by']).toBeUndefined();
            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBe('DENY');
        });
    });
});
