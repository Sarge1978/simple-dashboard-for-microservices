const request = require('supertest');
const { spawn } = require('child_process');
const path = require('path');

describe('Order Service Integration Tests', () => {
    let orderService;
    const servicePort = 3003;
    const baseUrl = `http://localhost:${servicePort}`;

    beforeAll((done) => {
        // Start the order service
        const servicePath = path.join(__dirname, '../examples/order-service.js');
        orderService = spawn('node', [servicePath], {
            env: { ...process.env, PORT: servicePort },
            stdio: ['ignore', 'pipe', 'pipe']
        });

        // Wait for service to start
        setTimeout(() => {
            done();
        }, 2000);
    });

    afterAll((done) => {
        if (orderService) {
            orderService.kill();
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
                service: 'order-service',
                timestamp: expect.any(String)
            });
        });

        it('should respond to ready check', async () => {
            const response = await request(baseUrl)
                .get('/ready')
                .expect(200);

            expect(response.body).toEqual({
                status: 'ready',
                service: 'order-service'
            });
        });
    });

    describe('Order CRUD Operations', () => {
        let createdOrderId;

        it('should create a new order', async () => {
            const newOrder = {
                userId: 1,
                items: [
                    { productId: 1, quantity: 2, price: 99.99 },
                    { productId: 2, quantity: 1, price: 49.99 }
                ],
                total: 249.97
            };

            const response = await request(baseUrl)
                .post('/api/orders')
                .send(newOrder)
                .expect(201);

            expect(response.body).toMatchObject({
                id: expect.any(Number),
                userId: newOrder.userId,
                items: expect.arrayContaining([
                    expect.objectContaining({
                        productId: 1,
                        quantity: 2,
                        price: 99.99
                    })
                ]),
                total: newOrder.total,
                status: 'pending',
                createdAt: expect.any(String)
            });

            createdOrderId = response.body.id;
        });

        it('should get all orders', async () => {
            const response = await request(baseUrl)
                .get('/api/orders')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should get order by id', async () => {
            const response = await request(baseUrl)
                .get(`/api/orders/${createdOrderId}`)
                .expect(200);

            expect(response.body).toMatchObject({
                id: createdOrderId,
                userId: 1,
                status: 'pending'
            });
        });

        it('should update order status', async () => {
            const statusUpdate = { status: 'processing' };

            const response = await request(baseUrl)
                .put(`/api/orders/${createdOrderId}`)
                .send(statusUpdate)
                .expect(200);

            expect(response.body.status).toBe('processing');
            expect(response.body.id).toBe(createdOrderId);
        });

        it('should get orders by user', async () => {
            const response = await request(baseUrl)
                .get('/api/orders/user/1')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(order => {
                expect(order.userId).toBe(1);
            });
        });

        it('should delete order', async () => {
            await request(baseUrl)
                .delete(`/api/orders/${createdOrderId}`)
                .expect(204);

            // Verify order is deleted
            await request(baseUrl)
                .get(`/api/orders/${createdOrderId}`)
                .expect(404);
        });

        it('should return 404 for non-existent order', async () => {
            await request(baseUrl)
                .get('/api/orders/99999')
                .expect(404);
        });

        it('should return 400 for invalid order data', async () => {
            const invalidOrder = {
                // Missing required fields
                items: 'invalid'
            };

            await request(baseUrl)
                .post('/api/orders')
                .send(invalidOrder)
                .expect(400);
        });
    });

    describe('Order Status Management', () => {
        let testOrderId;

        beforeEach(async () => {
            const newOrder = {
                userId: 2,
                items: [{ productId: 1, quantity: 1, price: 99.99 }],
                total: 99.99
            };

            const response = await request(baseUrl)
                .post('/api/orders')
                .send(newOrder);
            
            testOrderId = response.body.id;
        });

        it('should update order status to confirmed', async () => {
            const response = await request(baseUrl)
                .put(`/api/orders/${testOrderId}`)
                .send({ status: 'confirmed' })
                .expect(200);

            expect(response.body.status).toBe('confirmed');
        });

        it('should update order status to shipped', async () => {
            const response = await request(baseUrl)
                .put(`/api/orders/${testOrderId}`)
                .send({ status: 'shipped' })
                .expect(200);

            expect(response.body.status).toBe('shipped');
        });

        it('should update order status to delivered', async () => {
            const response = await request(baseUrl)
                .put(`/api/orders/${testOrderId}`)
                .send({ status: 'delivered' })
                .expect(200);

            expect(response.body.status).toBe('delivered');
        });

        it('should reject invalid status', async () => {
            await request(baseUrl)
                .put(`/api/orders/${testOrderId}`)
                .send({ status: 'invalid-status' })
                .expect(400);
        });
    });

    describe('Order Search and Filtering', () => {
        beforeAll(async () => {
            // Create test orders with different statuses
            const testOrders = [
                {
                    userId: 3,
                    items: [{ productId: 1, quantity: 1, price: 99.99 }],
                    total: 99.99,
                    status: 'pending'
                },
                {
                    userId: 3,
                    items: [{ productId: 2, quantity: 2, price: 49.99 }],
                    total: 99.98,
                    status: 'confirmed'
                },
                {
                    userId: 4,
                    items: [{ productId: 3, quantity: 1, price: 199.99 }],
                    total: 199.99,
                    status: 'shipped'
                }
            ];

            for (const order of testOrders) {
                const response = await request(baseUrl)
                    .post('/api/orders')
                    .send(order);
                
                if (order.status !== 'pending') {
                    await request(baseUrl)
                        .put(`/api/orders/${response.body.id}`)
                        .send({ status: order.status });
                }
            }
        });

        it('should filter orders by status', async () => {
            const response = await request(baseUrl)
                .get('/api/orders?status=confirmed')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(order => {
                expect(order.status).toBe('confirmed');
            });
        });

        it('should filter orders by date range', async () => {
            const today = new Date().toISOString().split('T')[0];
            const response = await request(baseUrl)
                .get(`/api/orders?fromDate=${today}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should handle server errors gracefully', async () => {
            // Test with malformed request
            await request(baseUrl)
                .post('/api/orders')
                .send('invalid json')
                .set('Content-Type', 'application/json')
                .expect(400);
        });

        it('should return proper error for unsupported methods', async () => {
            await request(baseUrl)
                .patch('/api/orders/1')
                .expect(405);
        });

        it('should handle invalid user ID', async () => {
            await request(baseUrl)
                .get('/api/orders/user/invalid')
                .expect(400);
        });
    });
});
