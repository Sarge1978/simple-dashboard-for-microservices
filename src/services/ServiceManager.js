class ServiceManager {
    constructor() {
        this.services = [
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
    }

    getAllServices() {
        return [...this.services];
    }

    getServiceById(id) {
        return this.services.find(service => service.id === id);
    }

    addService(serviceData) {
        const { name, url, description, endpoints } = serviceData;
        
        if (!name || !url) {
            throw new Error('Name and URL are required');
        }

        const newService = {
            id: Date.now(),
            name,
            url,
            description,
            endpoints: endpoints || [],
            status: 'unknown',
            lastCheck: null
        };

        this.services.push(newService);
        return newService;
    }

    removeService(id) {
        const index = this.services.findIndex(service => service.id === id);
        if (index === -1) {
            throw new Error('Service not found');
        }
        
        this.services.splice(index, 1);
        return true;
    }

    updateServiceStatus(id, status, lastCheck = null) {
        const service = this.getServiceById(id);
        if (!service) {
            throw new Error('Service not found');
        }

        service.status = status;
        service.lastCheck = lastCheck || new Date().toISOString();
        return service;
    }

    validateService(serviceData) {
        const { name, url } = serviceData;
        const errors = [];

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            errors.push('Name is required and must be a non-empty string');
        }

        if (!url || typeof url !== 'string') {
            errors.push('URL is required and must be a string');
        } else {
            try {
                new URL(url);
            } catch (error) {
                errors.push('URL must be a valid URL');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = ServiceManager;
