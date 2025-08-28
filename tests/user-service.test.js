const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Import the user service logic
function createUserServiceApp() {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Sample users data
    let users = [
        { id: 1, name: 'Ivan Ivanov', email: 'ivan@example.com', role: 'admin' },
        { id: 2, name: 'Maria Petrova', email: 'maria@example.com', role: 'user' },
        { id: 3, name: 'Alexey Sidorov', email: 'alexey@example.com', role: 'user' }
    ];

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ 
            status: 'ok', 
            service: 'User Service',
            timestamp: new Date().toISOString()
        });
    });

    // Get all users
    app.get('/users', (req, res) => {
        res.json(users);
    });

    // Get user by ID
    app.get('/users/:id', (req, res) => {
        const id = parseInt(req.params.id);
        const user = users.find(u => u.id === id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    });

    // Create new user
    app.post('/users', (req, res) => {
        const { name, email, role } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        
        const newUser = {
            id: users.length + 1,
            name,
            email,
            role: role || 'user'
        };
        
        users.push(newUser);
        res.status(201).json(newUser);
    });

    // Reset function for tests
    app._resetUsers = () => {
        users = [
            { id: 1, name: 'Ivan Ivanov', email: 'ivan@example.com', role: 'admin' },
            { id: 2, name: 'Maria Petrova', email: 'maria@example.com', role: 'user' },
            { id: 3, name: 'Alexey Sidorov', email: 'alexey@example.com', role: 'user' }
        ];
    };

    return app;
}

describe('User Service', () => {
    let app;

    beforeEach(() => {
        app = createUserServiceApp();
        app._resetUsers();
    });

    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('service', 'User Service');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    describe('GET /users', () => {
        it('should return all users', async () => {
            const response = await request(app)
                .get('/users')
                .expect(200);

            expect(response.body).toHaveLength(3);
            expect(response.body[0]).toHaveProperty('name', 'Ivan Ivanov');
        });
    });

    describe('GET /users/:id', () => {
        it('should return user by id', async () => {
            const response = await request(app)
                .get('/users/1')
                .expect(200);

            expect(response.body).toHaveProperty('id', 1);
            expect(response.body).toHaveProperty('name', 'Ivan Ivanov');
            expect(response.body).toHaveProperty('email', 'ivan@example.com');
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .get('/users/999')
                .expect(404);

            expect(response.body).toHaveProperty('error', 'User not found');
        });

        it('should handle invalid user id', async () => {
            const response = await request(app)
                .get('/users/invalid')
                .expect(404);

            expect(response.body).toHaveProperty('error', 'User not found');
        });
    });

    describe('POST /users', () => {
        it('should create new user with default role', async () => {
            const newUser = {
                name: 'New User',
                email: 'new@example.com'
            };

            const response = await request(app)
                .post('/users')
                .send(newUser)
                .expect(201);

            expect(response.body).toHaveProperty('id', 4);
            expect(response.body).toHaveProperty('name', 'New User');
            expect(response.body).toHaveProperty('email', 'new@example.com');
            expect(response.body).toHaveProperty('role', 'user');
        });

        it('should create new user with specified role', async () => {
            const newUser = {
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin'
            };

            const response = await request(app)
                .post('/users')
                .send(newUser)
                .expect(201);

            expect(response.body).toHaveProperty('role', 'admin');
        });

        it('should return 400 when name is missing', async () => {
            const invalidUser = {
                email: 'test@example.com'
            };

            const response = await request(app)
                .post('/users')
                .send(invalidUser)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Name and email are required');
        });

        it('should return 400 when email is missing', async () => {
            const invalidUser = {
                name: 'Test User'
            };

            const response = await request(app)
                .post('/users')
                .send(invalidUser)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Name and email are required');
        });

        it('should increment user IDs correctly', async () => {
            const user1 = {
                name: 'User 1',
                email: 'user1@example.com'
            };

            const user2 = {
                name: 'User 2',
                email: 'user2@example.com'
            };

            const response1 = await request(app)
                .post('/users')
                .send(user1)
                .expect(201);

            const response2 = await request(app)
                .post('/users')
                .send(user2)
                .expect(201);

            expect(response1.body.id).toBe(4);
            expect(response2.body.id).toBe(5);
        });
    });

    describe('CORS', () => {
        it('should include CORS headers', async () => {
            const response = await request(app)
                .get('/users')
                .expect(200);

            expect(response.headers).toHaveProperty('access-control-allow-origin');
        });
    });
});
