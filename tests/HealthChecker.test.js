const HealthChecker = require('../src/services/HealthChecker');
const axios = require('axios');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('HealthChecker', () => {
    let healthChecker;

    beforeEach(() => {
        healthChecker = new HealthChecker(5000);
        jest.clearAllMocks();
    });

    describe('checkServiceHealth', () => {
        const mockService = {
            id: 1,
            name: 'Test Service',
            url: 'http://localhost:3001'
        };

        it('should return online status for healthy service', async () => {
            mockedAxios.get.mockResolvedValue({
                status: 200,
                headers: { 'x-response-time': '50ms' }
            });

            const result = await healthChecker.checkServiceHealth(mockService);

            expect(result).toEqual({
                status: 'online',
                responseTime: '50ms'
            });
            expect(mockedAxios.get).toHaveBeenCalledWith(
                'http://localhost:3001/health',
                { timeout: 5000 }
            );
        });

        it('should return offline status for unhealthy service', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Connection refused'));

            const result = await healthChecker.checkServiceHealth(mockService);

            expect(result).toEqual({
                status: 'offline',
                responseTime: 'N/A',
                error: 'Connection refused'
            });
        });

        it('should return offline status for non-200 response', async () => {
            mockedAxios.get.mockResolvedValue({
                status: 500,
                headers: {}
            });

            const result = await healthChecker.checkServiceHealth(mockService);

            expect(result).toEqual({
                status: 'offline',
                responseTime: 'N/A'
            });
        });

        it('should handle missing response time header', async () => {
            mockedAxios.get.mockResolvedValue({
                status: 200,
                headers: {}
            });

            const result = await healthChecker.checkServiceHealth(mockService);

            expect(result).toEqual({
                status: 'online',
                responseTime: 'N/A'
            });
        });
    });

    describe('checkAllServices', () => {
        const mockServices = [
            { id: 1, name: 'Service 1', url: 'http://localhost:3001' },
            { id: 2, name: 'Service 2', url: 'http://localhost:3002' }
        ];

        it('should check health of all services', async () => {
            mockedAxios.get
                .mockResolvedValueOnce({
                    status: 200,
                    headers: { 'x-response-time': '50ms' }
                })
                .mockRejectedValueOnce(new Error('Connection refused'));

            const result = await healthChecker.checkAllServices(mockServices);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: 1,
                name: 'Service 1',
                status: 'online',
                responseTime: '50ms'
            });
            expect(result[1]).toEqual({
                id: 2,
                name: 'Service 2',
                status: 'offline',
                responseTime: 'N/A',
                error: 'Connection refused'
            });
        });

        it('should handle empty services array', async () => {
            const result = await healthChecker.checkAllServices([]);
            expect(result).toEqual([]);
        });
    });

    describe('constructor', () => {
        it('should use default timeout when not provided', () => {
            const checker = new HealthChecker();
            expect(checker.timeout).toBe(5000);
        });

        it('should use custom timeout when provided', () => {
            const checker = new HealthChecker(10000);
            expect(checker.timeout).toBe(10000);
        });
    });
});
