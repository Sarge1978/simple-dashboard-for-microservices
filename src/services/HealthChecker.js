const axios = require('axios');

class HealthChecker {
    constructor(timeout = 5000) {
        this.timeout = timeout;
    }

    async checkServiceHealth(service) {
        try {
            const response = await axios.get(`${service.url}/health`, { 
                timeout: this.timeout 
            });
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

    async checkAllServices(services) {
        const healthChecks = await Promise.all(
            services.map(async (service) => {
                const health = await this.checkServiceHealth(service);
                return {
                    id: service.id,
                    name: service.name,
                    ...health
                };
            })
        );
        return healthChecks;
    }
}

module.exports = HealthChecker;
