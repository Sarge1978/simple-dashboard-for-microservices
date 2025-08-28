const axios = require('axios');

class ApiClient {
    constructor(timeout = 10000) {
        this.timeout = timeout;
    }

    async executeRequest(service, requestData) {
        const { method, path, data, headers } = requestData;

        if (!service) {
            throw new Error('Service not found');
        }

        if (!method || !path) {
            throw new Error('Method and path are required');
        }

        try {
            const url = `${service.url}${path}`;
            const config = {
                method: method.toLowerCase(),
                url,
                headers: headers || {},
                timeout: this.timeout
            };

            if (data && this.shouldIncludeData(method)) {
                config.data = data;
            }

            const response = await axios(config);
            return {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data: response.data
            };
        } catch (error) {
            return {
                error: error.message,
                status: error.response && error.response.status,
                statusText: error.response && error.response.statusText,
                data: error.response && error.response.data
            };
        }
    }

    shouldIncludeData(method) {
        const methodsWithData = ['POST', 'PUT', 'PATCH'];
        return methodsWithData.includes(method.toUpperCase());
    }

    validateRequest(requestData) {
        const { method, path } = requestData;
        const errors = [];

        if (!method) {
            errors.push('Method is required');
        } else if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
            errors.push('Invalid HTTP method');
        }

        if (!path) {
            errors.push('Path is required');
        } else if (!path.startsWith('/')) {
            errors.push('Path must start with /');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = ApiClient;
