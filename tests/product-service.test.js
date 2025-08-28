const request = require('supertest');
const { spawn } = require('child_process');
const path = require('path');

describe('Product Service Integration Tests', () => {
    let productService;
    const servicePort = 3002;
    const baseUrl = `http://localhost:${servicePort}`;

    beforeAll((done) => {
        // Start the product service
        const servicePath = path.join(__dirname, '../examples/product-service.js');
        productService = spawn('node', [servicePath], {
            env: { ...process.env, PORT: servicePort },
            stdio: ['ignore', 'pipe', 'pipe']
        });

        // Wait for service to start
        setTimeout(() => {
            done();
        }, 2000);
    });

    afterAll((done) => {
        if (productService) {
            productService.kill();
            setTimeout(done, 1000);
        } else {
            done();
        }
    });

    describe('Health Endpoints', () => {
        it('should respond to health check', async () => {
            const response = await request(baseUrl)
                .get('/health')
                .expect(200);

            expect(response.body).toEqual({
                status: 'OK',
                service: 'product-service',
                timestamp: expect.any(String)
            });
        });

        it('should respond to ready check', async () => {
            const response = await request(baseUrl)
                .get('/ready')
                .expect(200);

            expect(response.body).toEqual({
                status: 'ready',
                service: 'product-service'
            });
        });
    });

    describe('Product CRUD Operations', () => {
        let createdProductId;

        it('should create a new product', async () => {
            const newProduct = {
                name: 'Test Product',
                price: 99.99,
                category: 'Electronics'
            };

            const response = await request(baseUrl)
                .post('/api/products')
                .send(newProduct)
                .expect(201);

            expect(response.body).toMatchObject({
                id: expect.any(Number),
                name: newProduct.name,
                price: newProduct.price,
                category: newProduct.category,
                createdAt: expect.any(String)
            });

            createdProductId = response.body.id;
        });

        it('should get all products', async () => {
            const response = await request(baseUrl)
                .get('/api/products')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should get product by id', async () => {
            const response = await request(baseUrl)
                .get(`/api/products/${createdProductId}`)
                .expect(200);

            expect(response.body).toMatchObject({
                id: createdProductId,
                name: 'Test Product',
                price: 99.99,
                category: 'Electronics'
            });
        });

        it('should update product', async () => {
            const updates = {
                name: 'Updated Product',
                price: 149.99
            };

            const response = await request(baseUrl)
                .put(`/api/products/${createdProductId}`)
                .send(updates)
                .expect(200);

            expect(response.body).toMatchObject({
                id: createdProductId,
                name: updates.name,
                price: updates.price,
                category: 'Electronics'
            });
        });

        it('should delete product', async () => {
            await request(baseUrl)
                .delete(`/api/products/${createdProductId}`)
                .expect(204);

            // Verify product is deleted
            await request(baseUrl)
                .get(`/api/products/${createdProductId}`)
                .expect(404);
        });

        it('should return 404 for non-existent product', async () => {
            await request(baseUrl)
                .get('/api/products/99999')
                .expect(404);
        });

        it('should return 400 for invalid product data', async () => {
            const invalidProduct = {
                // Missing required fields
                price: 'invalid'
            };

            await request(baseUrl)
                .post('/api/products')
                .send(invalidProduct)
                .expect(400);
        });
    });

    describe('Product Search and Filtering', () => {
        beforeAll(async () => {
            // Create test products
            const testProducts = [
                { name: 'Laptop', price: 999.99, category: 'Electronics' },
                { name: 'Book', price: 19.99, category: 'Books' },
                { name: 'Smartphone', price: 599.99, category: 'Electronics' }
            ];

            for (const product of testProducts) {
                await request(baseUrl)
                    .post('/api/products')
                    .send(product);
            }
        });

        it('should search products by category', async () => {
            const response = await request(baseUrl)
                .get('/api/products?category=Electronics')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(product => {
                expect(product.category).toBe('Electronics');
            });
        });

        it('should search products by price range', async () => {
            const response = await request(baseUrl)
                .get('/api/products?minPrice=500&maxPrice=1000')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(product => {
                expect(product.price).toBeGreaterThanOrEqual(500);
                expect(product.price).toBeLessThanOrEqual(1000);
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle server errors gracefully', async () => {
            // Test with malformed request
            await request(baseUrl)
                .post('/api/products')
                .send('invalid json')
                .set('Content-Type', 'application/json')
                .expect(400);
        });

        it('should return proper error for unsupported methods', async () => {
            await request(baseUrl)
                .patch('/api/products/1')
                .expect(405);
        });
    });
});
