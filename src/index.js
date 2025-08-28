const express = require('express');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const socketio = require('socket.io');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();
const server = createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// In-memory storage for microservices (use database in production)
let microservices = [
    {
        id: 1,
        name: 'User Service',
        url: 'http://localhost:3001',
        status: 'unknown',
        lastCheck: null,
        description: 'User management',
        endpoints: [
            { method: 'GET', path: '/users', description: 'Get all users' },
            { method: 'POST', path: '/users', description: 'Create user' },
            { method: 'GET', path: '/users/:id', description: 'Get user by ID' }
        ]
    },
    {
        id: 2,
        name: 'Product Service',
        url: 'http://localhost:3002',
        status: 'unknown',
        lastCheck: null,
        description: 'Product management',
        endpoints: [
            { method: 'GET', path: '/products', description: 'Get all products' },
            { method: 'POST', path: '/products', description: 'Create product' },
            { method: 'GET', path: '/products/:id', description: 'Get product by ID' }
        ]
    },
    {
        id: 3,
        name: 'Order Service',
        url: 'http://localhost:3003',
        status: 'unknown',
        lastCheck: null,
        description: 'Order management',
        endpoints: [
            { method: 'GET', path: '/orders', description: 'Get all orders' },
            { method: 'POST', path: '/orders', description: 'Create order' },
            { method: 'GET', path: '/orders/:id', description: 'Get order by ID' }
        ]
    }
];

// Function to check service health
async function checkServiceHealth(service) {
    try {
        const response = await axios.get(`${service.url}/health`, { timeout: 5000 });
        return {
            status: response.status === 200 ? 'online' : 'offline',
            responseTime: response.headers['x-response-time'] || 'N/A'
        };
    } catch (error) {
        return {
            status: 'offline',
            responseTime: 'N/A',
            error: error.message
        };
    }
}

// API Routes
app.get('/api/services', (req, res) => {
    res.json(microservices);
});

app.post('/api/services', (req, res) => {
    const { name, url, description, endpoints } = req.body;
    const newService = {
        id: Date.now(),
        name,
        url,
        description,
        endpoints: endpoints || [],
        status: 'unknown',
        lastCheck: null
    };
    microservices.push(newService);
    res.status(201).json(newService);
});

app.delete('/api/services/:id', (req, res) => {
    const id = parseInt(req.params.id);
    microservices = microservices.filter(service => service.id !== id);
    res.status(204).send();
});

// Health check for specific service
app.get('/api/services/:id/health', async (req, res) => {
    const id = parseInt(req.params.id);
    const service = microservices.find(s => s.id === id);
    
    if (!service) {
        return res.status(404).json({ error: 'Service not found' });
    }

    const health = await checkServiceHealth(service);
    service.status = health.status;
    service.lastCheck = new Date().toISOString();
    
    res.json(health);
});

// Execute API request to microservice
app.post('/api/services/:id/request', async (req, res) => {
    const id = parseInt(req.params.id);
    const { method, path, data, headers } = req.body;
    const service = microservices.find(s => s.id === id);
    
    if (!service) {
        return res.status(404).json({ error: 'Service not found' });
    }

    try {
        const url = `${service.url}${path}`;
        const config = {
            method: method.toLowerCase(),
            url,
            headers: headers || {},
            timeout: 10000
        };

        if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH')) {
            config.data = data;
        }

        const response = await axios(config);
        res.json({
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            status: error.response && error.response.status,
            statusText: error.response && error.response.statusText,
            data: error.response && error.response.data
        });
    }
});

// Health check all services
app.get('/api/health/all', async (req, res) => {
    const healthChecks = await Promise.all(
        microservices.map(async (service) => {
            const health = await checkServiceHealth(service);
            service.status = health.status;
            service.lastCheck = new Date().toISOString();
            return {
                id: service.id,
                name: service.name,
                ...health
            };
        })
    );
    
    res.json(healthChecks);
});

// WebSocket connection for real-time updates
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Periodic health checks and broadcast updates
setInterval(async () => {
    const healthUpdates = await Promise.all(
        microservices.map(async (service) => {
            const health = await checkServiceHealth(service);
            service.status = health.status;
            service.lastCheck = new Date().toISOString();
            return {
                id: service.id,
                name: service.name,
                status: health.status,
                responseTime: health.responseTime,
                lastCheck: service.lastCheck
            };
        })
    );
    
    io.emit('health-update', healthUpdates);
}, 30000); // Check every 30 seconds

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

server.listen(PORT, () => {
    console.log(`🚀 Simple Dashboard for Microservices running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard available at http://localhost:${PORT}`);
});