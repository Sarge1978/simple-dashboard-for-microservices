const jwt = require('jsonwebtoken');

// In-memory user storage (use database in production)
const users = [
    {
        id: 1,
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        email: 'admin@example.com',
        createdAt: new Date()
    },
    {
        id: 2,
        username: 'user',
        password: 'user123',
        role: 'user',
        email: 'user@example.com',
        createdAt: new Date()
    }
];

// Simple session storage for development
const activeSessions = new Map();

const JWT_SECRET = 'simple-dashboard-secret-key-for-development';
const JWT_EXPIRES_IN = '24h';

class AuthService {
    static generateSimpleToken(user) {
        // Generate a simple token for development
        const tokenData = {
            id: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
            timestamp: Date.now()
        };
        
        const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');
        activeSessions.set(token, tokenData);
        return token;
    }

    static verifySimpleToken(token) {
        const sessionData = activeSessions.get(token);
        if (!sessionData) {
            throw new Error('Invalid token');
        }
        
        // Check if token is expired (24 hours)
        if (Date.now() - sessionData.timestamp > 24 * 60 * 60 * 1000) {
            activeSessions.delete(token);
            throw new Error('Token expired');
        }
        
        return sessionData;
    }

    static async login(username, password) {
        try {
            const user = users.find(u => u.username === username);
            if (!user) {
                throw new Error('User not found');
            }

            // Simple password comparison for development
            if (password !== user.password) {
                throw new Error('Invalid password');
            }

            const token = this.generateSimpleToken(user);
            return {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    email: user.email
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async register(userData) {
        const existingUser = users.find(u => u.username === userData.username || u.email === userData.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const newUser = {
            id: users.length + 1,
            username: userData.username,
            password: userData.password, // Plain text for development
            role: userData.role || 'user',
            email: userData.email,
            createdAt: new Date()
        };

        users.push(newUser);
        
        const token = this.generateSimpleToken(newUser);
        return {
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
                email: newUser.email
            }
        };
    }

    static getUsers() {
        return users.map(user => ({
            id: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
            createdAt: user.createdAt
        }));
    }

    static getUserById(id) {
        const user = users.find(u => u.id === parseInt(id));
        if (!user) return null;
        
        return {
            id: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
            createdAt: user.createdAt
        };
    }

    static logout(token) {
        activeSessions.delete(token);
    }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = AuthService.verifySimpleToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Authorization middleware
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};

module.exports = {
    AuthService,
    authenticateToken,
    requireRole
};
