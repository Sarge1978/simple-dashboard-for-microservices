const request = require('supertest');
const { spawn } = require('child_process');
const path = require('path');

describe('End-to-End Integration Tests', () => {
    let mainServer, userService, productService, orderService;
    const mainPort = 3000;
    const userPort = 3001;
    const productPort = 3002;
    const orderPort = 3003;

    beforeAll((done) => {
        // Start main server
        const mainPath = path.join(__dirname, '../src/index.js');
        mainServer = spawn('node', [mainPath], {
            env: { ...process.env, PORT: mainPort },
            stdio: ['ignore', 'pipe', 'pipe']
        });

        // Start microservices
        const userPath = path.join(__dirname, '../examples/user-service.js');
        userService = spawn('node', [userPath], {
            env: { ...process.env, PORT: userPort },
            stdio: ['ignore', 'pipe', 'pipe']
        });

        const productPath = path.join(__dirname, '../examples/product-service.js');
        productService = spawn('node', [productPath], {
            env: { ...process.env, PORT: productPort },
            stdio: ['ignore', 'pipe', 'pipe']
        });

        const orderPath = path.join(__dirname, '../examples/order-service.js');
        orderService = spawn('node', [orderPath], {
            env: { ...process.env, PORT: orderPort },
            stdio: ['ignore', 'pipe', 'pipe']
        });

        // Wait for all services to start
        setTimeout(() => {
            done();
        }, 5000);
    });

    afterAll((done) => {
        const services = [mainServer, userService, productService, orderService];
        services.forEach(service => {
            if (service) service.kill();
        });
        setTimeout(done, 2000);
    });

    describe('Complete User Journey', () => {
        let userId, productId, orderId;

        it('should register services with dashboard', async () => {
            const services = [
                {
                    name: 'User Service',
                    url: `http://localhost:${userPort}`,
                    description: 'Manages user accounts'
                },
                {
                    name: 'Product Service',
                    url: `http://localhost:${productPort}`,
                    description: 'Manages product catalog'
                },
                {
                    name: 'Order Service',
                    url: `http://localhost:${orderPort}`,
                    description: 'Manages customer orders'
                }
            ];

            for (const service of services) {
                await request(`http://localhost:${mainPort}`)
                    .post('/api/services')
                    .send(service)
                    .expect(201);
            }
        });

        it('should create a user through user service', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1234567890'
            };

            const response = await request(`http://localhost:${userPort}`)
                .post('/api/users')
                .send(newUser)
                .expect(201);

            expect(response.body).toMatchObject({
                id: expect.any(Number),
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone
            });

            userId = response.body.id;
        });

        it('should create a product through product service', async () => {
            const newProduct = {
                name: 'E2E Test Product',
                price: 99.99,
                category: 'Test'
            };

            const response = await request(`http://localhost:${productPort}`)
                .post('/api/products')
                .send(newProduct)
                .expect(201);

            expect(response.body).toMatchObject({
                id: expect.any(Number),
                name: newProduct.name,
                price: newProduct.price,
                category: newProduct.category
            });

            productId = response.body.id;
        });

        it('should create an order through order service', async () => {
            const newOrder = {
                userId: userId,
                items: [
                    { productId: productId, quantity: 2, price: 99.99 }
                ],
                total: 199.98
            };

            const response = await request(`http://localhost:${orderPort}`)
                .post('/api/orders')
                .send(newOrder)
                .expect(201);

            expect(response.body).toMatchObject({
                id: expect.any(Number),
                userId: userId,
                items: expect.arrayContaining([
                    expect.objectContaining({
                        productId: productId,
                        quantity: 2
                    })
                ]),
                total: 199.98,
                status: 'pending'
            });

            orderId = response.body.id;
        });

        it('should process order workflow', async () => {
            // Update order status to confirmed
            await request(`http://localhost:${orderPort}`)
                .put(`/api/orders/${orderId}`)
                .send({ status: 'confirmed' })
                .expect(200);

            // Update order status to shipped
            await request(`http://localhost:${orderPort}`)
                .put(`/api/orders/${orderId}`)
                .send({ status: 'shipped' })
                .expect(200);

            // Verify final status
            const response = await request(`http://localhost:${orderPort}`)
                .get(`/api/orders/${orderId}`)
                .expect(200);

            expect(response.body.status).toBe('shipped');
        });

        it('should check health of all services through dashboard', async () => {
            const response = await request(`http://localhost:${mainPort}`)
                .get('/api/health/all')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            response.body.forEach(service => {
                expect(service).toHaveProperty('id');
                expect(service).toHaveProperty('name');
                expect(service).toHaveProperty('status');
                expect(['online', 'offline', 'unknown']).toContain(service.status);
            });
        });
    });

    describe('Cross-Service Data Consistency', () => {
        it('should maintain data consistency across services', async () => {
            // Create user
            const user = await request(`http://localhost:${userPort}`)
                .post('/api/users')
                .send({
                    name: 'Test User',
                    email: 'test@example.com'
                });

            const userId = user.body.id;

            // Create product
            const product = await request(`http://localhost:${productPort}`)
                .post('/api/products')
                .send({
                    name: 'Test Product',
                    price: 50.00,
                    category: 'Test'
                });

            const productId = product.body.id;

            // Create order with both user and product
            const order = await request(`http://localhost:${orderPort}`)
                .post('/api/orders')
                .send({
                    userId: userId,
                    items: [{ productId: productId, quantity: 1, price: 50.00 }],
                    total: 50.00
                });

            const orderId = order.body.id;

            // Verify relationships
            const orderDetails = await request(`http://localhost:${orderPort}`)
                .get(`/api/orders/${orderId}`)
                .expect(200);

            expect(orderDetails.body.userId).toBe(userId);
            expect(orderDetails.body.items[0].productId).toBe(productId);
        });
    });

    describe('Error Scenarios', () => {
        it('should handle service unavailability gracefully', async () => {
            // Test dashboard API when a service is down
            const response = await request(`http://localhost:${mainPort}`)
                .get('/api/health/all');

            // Should still respond even if some services are down
            expect([200, 500]).toContain(response.status);
        });

        it('should handle invalid cross-service requests', async () => {
            // Try to create order with non-existent user
            await request(`http://localhost:${orderPort}`)
                .post('/api/orders')
                .send({
                    userId: 99999,
                    items: [{ productId: 1, quantity: 1, price: 50.00 }],
                    total: 50.00
                })
                .expect(400);
        });
    });

    describe('Performance Under Load', () => {
        it('should handle multiple concurrent requests', async () => {
            const promises = [];
            
            // Create multiple concurrent health checks
            for (let i = 0; i < 10; i++) {
                promises.push(
                    request(`http://localhost:${mainPort}`)
                        .get('/api/health/all')
                );
            }

            const results = await Promise.all(promises);
            
            results.forEach(result => {
                expect([200, 500]).toContain(result.status);
            });
        });

        it('should handle mixed operations efficiently', async () => {
            const operations = [];
            
            // Mix of different operations
            for (let i = 0; i < 5; i++) {
                operations.push(
                    request(`http://localhost:${userPort}`)
                        .get('/api/users')
                );
                
                operations.push(
                    request(`http://localhost:${productPort}`)
                        .get('/api/products')
                );
                
                operations.push(
                    request(`http://localhost:${orderPort}`)
                        .get('/api/orders')
                );
            }

            const start = Date.now();
            const results = await Promise.all(operations);
            const duration = Date.now() - start;

            // All operations should complete within reasonable time
            expect(duration).toBeLessThan(5000);
            
            results.forEach(result => {
                expect(result.status).toBe(200);
            });
        });
    });

    describe('Data Validation Across Services', () => {
        it('should validate data types consistently', async () => {
            // Test invalid data across all services
            const invalidRequests = [
                request(`http://localhost:${userPort}`)
                    .post('/api/users')
                    .send({ name: 123 }), // Invalid name type
                
                request(`http://localhost:${productPort}`)
                    .post('/api/products')
                    .send({ price: 'invalid' }), // Invalid price type
                
                request(`http://localhost:${orderPort}`)
                    .post('/api/orders')
                    .send({ total: 'invalid' }) // Invalid total type
            ];

            const results = await Promise.allSettled(invalidRequests);
            
            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    expect(result.value.status).toBe(400);
                }
            });
        });
    });
});
