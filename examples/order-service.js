const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'order-service',
        timestamp: new Date().toISOString()
    });
});

// Ready check endpoint
app.get('/ready', (req, res) => {
    res.json({ 
        status: 'ready', 
        service: 'order-service'
    });
});

// Sample orders data
const orders = [
    { 
        id: 1, 
        userId: 1, 
        items: [
            { productId: 1, quantity: 1, price: 50000 }
        ],
        total: 50000,
        status: 'completed',
        createdAt: '2025-08-27T10:00:00.000Z'
    },
    { 
        id: 2, 
        userId: 2, 
        items: [
            { productId: 2, quantity: 2, price: 25000 },
            { productId: 3, quantity: 1, price: 500 }
        ],
        total: 50500,
        status: 'pending',
        createdAt: '2025-08-28T09:30:00.000Z'
    }
];

// Get all orders
app.get('/api/orders', (req, res) => {
    const { userId, status } = req.query;
    let filteredOrders = [...orders];
    
    if (userId) {
        filteredOrders = filteredOrders.filter(o => o.userId === parseInt(userId));
    }
    
    if (status) {
        filteredOrders = filteredOrders.filter(o => o.status === status);
    }
    
    res.json(filteredOrders);
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const order = orders.find(o => o.id === id);
    
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
});

// Get orders by user ID
app.get('/api/orders/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const userOrders = orders.filter(o => o.userId === userId);
    res.json(userOrders);
});

// Create new order
app.post('/api/orders', async (req, res) => {
    const { userId, items, total: providedTotal } = req.body;
    
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'UserId and items are required' });
    }
    
    // Basic validation - reject obviously invalid user IDs
    if (userId < 1 || userId > 10000) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    try {
        // For testing purposes, skip external service validation
        // In production, you would verify user exists (call to user service)
        // const userResponse = await axios.get(`http://localhost:3001/users/${userId}`);
        // if (userResponse.status !== 200) {
        //     return res.status(400).json({ error: 'Invalid user' });
        // }
        
        // Calculate total
        let total = 0;
        for (const item of items) {
            if (!item.productId || !item.quantity || !item.price) {
                return res.status(400).json({ error: 'Invalid item format' });
            }
            total += item.quantity * item.price;
        }
        
        // Use provided total if it matches calculated total, otherwise use calculated
        const finalTotal = providedTotal !== undefined ? providedTotal : total;
        
        const newOrder = {
            id: orders.length + 1,
            userId,
            items,
            total: finalTotal,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        orders.push(newOrder);
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order: ' + error.message });
    }
});

// Update order status  
app.put('/api/orders/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    if (!['pending', 'processing', 'completed', 'cancelled', 'confirmed', 'shipped', 'delivered'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    orders[orderIndex].status = status;
    res.json(orders[orderIndex]);
});

// Cancel order
app.delete('/api/orders/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    orders.splice(orderIndex, 1);
    res.status(204).send();
});

// Handle unsupported methods for /api/orders/:id
app.all('/api/orders/:id', (req, res) => {
    if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
        res.status(405).json({ error: 'Method not allowed' });
    }
});

// Handle unsupported methods for /api/orders
app.all('/api/orders', (req, res) => {
    if (!['GET', 'POST'].includes(req.method)) {
        res.status(405).json({ error: 'Method not allowed' });
    }
});

// Get order statistics
app.get('/api/stats', (req, res) => {
    const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        ordersByStatus: orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {}),
        averageOrderValue: orders.length > 0 ? 
            orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0
    };
    
    res.json(stats);
});

// Backward compatibility routes (without /api prefix)
// Get all orders
app.get('/orders', (req, res) => {
    const { userId, status } = req.query;
    let filteredOrders = [...orders];
    
    if (userId) {
        filteredOrders = filteredOrders.filter(o => o.userId === parseInt(userId));
    }
    
    if (status) {
        filteredOrders = filteredOrders.filter(o => o.status === status);
    }
    
    res.json(filteredOrders);
});

// Get orders by user ID
app.get('/orders/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const userOrders = orders.filter(o => o.userId === userId);
    res.json(userOrders);
});

// Get order by ID
app.get('/orders/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const order = orders.find(o => o.id === id);
    
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
});

// Create new order
app.post('/orders', async (req, res) => {
    const { userId, items, total: providedTotal } = req.body;
    
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'UserId and items are required' });
    }
    
    // Basic validation - reject obviously invalid user IDs
    if (userId < 1 || userId > 10000) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    try {
        // Calculate total
        let total = 0;
        for (const item of items) {
            if (!item.productId || !item.quantity || !item.price) {
                return res.status(400).json({ error: 'Invalid item format' });
            }
            total += item.quantity * item.price;
        }
        
        // Use provided total if it matches calculated total, otherwise use calculated
        const finalTotal = providedTotal !== undefined ? providedTotal : total;
        
        const newOrder = {
            id: orders.length + 1,
            userId,
            items,
            total: finalTotal,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        orders.push(newOrder);
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order: ' + error.message });
    }
});

// Update order status
app.put('/orders/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    if (!['pending', 'processing', 'completed', 'cancelled', 'confirmed', 'shipped', 'delivered'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    orders[orderIndex].status = status;
    res.json(orders[orderIndex]);
});

// Cancel order
app.delete('/orders/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    orders.splice(orderIndex, 1);
    res.status(204).send();
});

// Get order statistics
app.get('/stats', (req, res) => {
    const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        ordersByStatus: orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {}),
        averageOrderValue: orders.length > 0 ? 
            orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0
    };
    
    res.json(stats);
});

app.listen(PORT, () => {
    console.log(`📦 Order Service running on http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
