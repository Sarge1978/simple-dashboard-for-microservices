const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'User Service',
        timestamp: new Date().toISOString()
    });
});

// Sample users data
const users = [
    { id: 1, name: 'Ivan Ivanov', email: 'ivan@example.com', role: 'admin' },
    { id: 2, name: 'Maria Petrova', email: 'maria@example.com', role: 'user' },
    { id: 3, name: 'Alexey Sidorov', email: 'alexey@example.com', role: 'user' }
];

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

// Update user
app.put('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const { name, email, role } = req.body;
    users[userIndex] = { ...users[userIndex], name, email, role };
    
    res.json(users[userIndex]);
});

// Delete user
app.delete('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    users.splice(userIndex, 1);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`📱 User Service running on http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
