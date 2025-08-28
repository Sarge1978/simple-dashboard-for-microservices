const ServiceManager = require('../src/services/ServiceManager');

describe('ServiceManager', () => {
    let serviceManager;

    beforeEach(() => {
        serviceManager = new ServiceManager();
    });

    describe('getAllServices', () => {
        it('should return all services', () => {
            const services = serviceManager.getAllServices();
            expect(services).toHaveLength(3);
            expect(services[0]).toHaveProperty('name', 'User Service');
            expect(services[1]).toHaveProperty('name', 'Product Service');
            expect(services[2]).toHaveProperty('name', 'Order Service');
        });

        it('should return a copy of services array', () => {
            const services1 = serviceManager.getAllServices();
            const services2 = serviceManager.getAllServices();
            expect(services1).not.toBe(services2);
            expect(services1).toEqual(services2);
        });
    });

    describe('getServiceById', () => {
        it('should return service by id', () => {
            const service = serviceManager.getServiceById(1);
            expect(service).toHaveProperty('name', 'User Service');
            expect(service).toHaveProperty('id', 1);
        });

        it('should return undefined for non-existent service', () => {
            const service = serviceManager.getServiceById(999);
            expect(service).toBeUndefined();
        });
    });

    describe('addService', () => {
        it('should add a new service successfully', () => {
            const serviceData = {
                name: 'New Service',
                url: 'http://localhost:3004',
                description: 'Test service'
            };

            const newService = serviceManager.addService(serviceData);

            expect(newService).toHaveProperty('name', 'New Service');
            expect(newService).toHaveProperty('url', 'http://localhost:3004');
            expect(newService).toHaveProperty('description', 'Test service');
            expect(newService).toHaveProperty('id');
            expect(newService).toHaveProperty('status', 'unknown');
            expect(newService).toHaveProperty('endpoints', []);

            const allServices = serviceManager.getAllServices();
            expect(allServices).toHaveLength(4);
        });

        it('should add service with endpoints', () => {
            const serviceData = {
                name: 'API Service',
                url: 'http://localhost:3005',
                description: 'API service',
                endpoints: [
                    { method: 'GET', path: '/api/test', description: 'Test endpoint' }
                ]
            };

            const newService = serviceManager.addService(serviceData);
            expect(newService.endpoints).toHaveLength(1);
            expect(newService.endpoints[0]).toEqual({
                method: 'GET',
                path: '/api/test',
                description: 'Test endpoint'
            });
        });

        it('should throw error when name is missing', () => {
            const serviceData = {
                url: 'http://localhost:3004'
            };

            expect(() => serviceManager.addService(serviceData))
                .toThrow('Name and URL are required');
        });

        it('should throw error when url is missing', () => {
            const serviceData = {
                name: 'Test Service'
            };

            expect(() => serviceManager.addService(serviceData))
                .toThrow('Name and URL are required');
        });
    });

    describe('removeService', () => {
        it('should remove service successfully', () => {
            const initialCount = serviceManager.getAllServices().length;
            const result = serviceManager.removeService(1);

            expect(result).toBe(true);
            expect(serviceManager.getAllServices()).toHaveLength(initialCount - 1);
            expect(serviceManager.getServiceById(1)).toBeUndefined();
        });

        it('should throw error when service not found', () => {
            expect(() => serviceManager.removeService(999))
                .toThrow('Service not found');
        });
    });

    describe('updateServiceStatus', () => {
        it('should update service status successfully', () => {
            const testDate = '2025-08-28T12:00:00.000Z';
            const updatedService = serviceManager.updateServiceStatus(1, 'online', testDate);

            expect(updatedService.status).toBe('online');
            expect(updatedService.lastCheck).toBe(testDate);
        });

        it('should use current timestamp when lastCheck not provided', () => {
            const beforeUpdate = Date.now();
            const updatedService = serviceManager.updateServiceStatus(1, 'offline');
            const afterUpdate = Date.now();

            expect(updatedService.status).toBe('offline');
            expect(new Date(updatedService.lastCheck).getTime()).toBeGreaterThanOrEqual(beforeUpdate);
            expect(new Date(updatedService.lastCheck).getTime()).toBeLessThanOrEqual(afterUpdate);
        });

        it('should throw error when service not found', () => {
            expect(() => serviceManager.updateServiceStatus(999, 'online'))
                .toThrow('Service not found');
        });
    });

    describe('validateService', () => {
        it('should validate correct service data', () => {
            const serviceData = {
                name: 'Valid Service',
                url: 'http://localhost:3004'
            };

            const validation = serviceManager.validateService(serviceData);
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        it('should reject service with empty name', () => {
            const serviceData = {
                name: '',
                url: 'http://localhost:3004'
            };

            const validation = serviceManager.validateService(serviceData);
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Name is required and must be a non-empty string');
        });

        it('should reject service with missing name', () => {
            const serviceData = {
                url: 'http://localhost:3004'
            };

            const validation = serviceManager.validateService(serviceData);
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Name is required and must be a non-empty string');
        });

        it('should reject service with invalid URL', () => {
            const serviceData = {
                name: 'Test Service',
                url: 'not-a-url'
            };

            const validation = serviceManager.validateService(serviceData);
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('URL must be a valid URL');
        });

        it('should reject service with missing URL', () => {
            const serviceData = {
                name: 'Test Service'
            };

            const validation = serviceManager.validateService(serviceData);
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('URL is required and must be a string');
        });

        it('should collect multiple validation errors', () => {
            const serviceData = {
                name: '',
                url: 'invalid-url'
            };

            const validation = serviceManager.validateService(serviceData);
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(2);
        });
    });
});
