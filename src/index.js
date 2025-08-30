const express = require('express');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const socketio = require('socket.io');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

// Import our custom services
const { AuthService, authenticateToken, requireRole } = require('./services/AuthService');
const PerformanceMonitor = require('./services/PerformanceMonitor');

const app = express();
const server = createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize performance monitor
const performanceMonitor = new PerformanceMonitor(true);

const PORT = process.env.PORT || 3000;

// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        performanceMonitor.recordRequest(req, res, responseTime);
    });
    
    next();
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(performanceMiddleware);

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
    const startTime = Date.now();
    try {
        const response = await axios.get(`${service.url}/health`, { timeout: 5000 });
        const responseTime = Date.now() - startTime;
        
        // Record service health metrics
        performanceMonitor.recordServiceHealth(
            service.id, 
            service.name, 
            response.status === 200 ? 'online' : 'offline', 
            responseTime
        );
        
        return {
            status: response.status === 200 ? 'online' : 'offline',
            responseTime: responseTime
        };
    } catch (error) {
        const responseTime = Date.now() - startTime;
        
        // Record service health metrics for failed checks
        performanceMonitor.recordServiceHealth(
            service.id, 
            service.name, 
            'offline', 
            responseTime
        );
        
        return {
            status: 'offline',
            responseTime: responseTime,
            error: error.message
        };
    }
}

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const result = await AuthService.login(username, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, email, role } = req.body;
        
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Username, password, and email are required' });
        }

        const result = await AuthService.register({ username, password, email, role });
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

app.get('/api/auth/users', authenticateToken, requireRole(['admin']), (req, res) => {
    const users = AuthService.getUsers();
    res.json(users);
});

// Analytics Routes
app.get('/api/analytics/dashboard', authenticateToken, (req, res) => {
    const timeRange = req.query.timeRange || '1h';
    const analytics = performanceMonitor.getDashboardAnalytics(timeRange);
    res.json(analytics);
});

app.get('/api/analytics/system', authenticateToken, (req, res) => {
    const systemMetrics = performanceMonitor.getCurrentSystemMetrics();
    res.json(systemMetrics);
});

app.post('/api/analytics/clear', authenticateToken, requireRole(['admin']), (req, res) => {
    performanceMonitor.clearMetrics();
    res.json({ message: 'Analytics data cleared successfully' });
});

// API Routes (Protected)
app.get('/api/services', authenticateToken, (req, res) => {
    res.json(microservices);
});

app.post('/api/services', authenticateToken, requireRole(['admin']), (req, res) => {
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

app.delete('/api/services/:id', authenticateToken, requireRole(['admin']), (req, res) => {
    const id = parseInt(req.params.id);
    microservices = microservices.filter(service => service.id !== id);
    res.status(204).send();
});

// Health check for specific service
app.get('/api/services/:id/health', authenticateToken, async (req, res) => {
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
app.post('/api/services/:id/request', authenticateToken, async (req, res) => {
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
app.get('/api/health/all', authenticateToken, async (req, res) => {
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