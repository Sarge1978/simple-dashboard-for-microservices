const ApiClient = require('../src/services/ApiClient');
const axios = require('axios');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('ApiClient', () => {
    let apiClient;

    beforeEach(() => {
        apiClient = new ApiClient(10000);
        jest.clearAllMocks();
    });

    describe('executeRequest', () => {
        const mockService = {
            id: 1,
            name: 'Test Service',
            url: 'http://localhost:3001'
        };

        it('should execute GET request successfully', async () => {
            const mockResponse = {
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
                data: { message: 'success' }
            };

            mockedAxios.mockResolvedValue(mockResponse);

            const requestData = {
                method: 'GET',
                path: '/api/test'
            };

            const result = await apiClient.executeRequest(mockService, requestData);

            expect(result).toEqual({
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
                data: { message: 'success' }
            });

            expect(mockedAxios).toHaveBeenCalledWith({
                method: 'get',
                url: 'http://localhost:3001/api/test',
                headers: {},
                timeout: 10000
            });
        });

        it('should execute POST request with data', async () => {
            const mockResponse = {
                status: 201,
                statusText: 'Created',
                headers: {},
                data: { id: 1, name: 'created' }
            };

            mockedAxios.mockResolvedValue(mockResponse);

            const requestData = {
                method: 'POST',
                path: '/api/users',
                data: { name: 'John Doe' },
                headers: { 'Content-Type': 'application/json' }
            };

            const result = await apiClient.executeRequest(mockService, requestData);

            expect(result).toEqual({
                status: 201,
                statusText: 'Created',
                headers: {},
                data: { id: 1, name: 'created' }
            });

            expect(mockedAxios).toHaveBeenCalledWith({
                method: 'post',
                url: 'http://localhost:3001/api/users',
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000,
                data: { name: 'John Doe' }
            });
        });

        it('should not include data for GET requests', async () => {
            mockedAxios.mockResolvedValue({
                status: 200,
                statusText: 'OK',
                headers: {},
                data: {}
            });

            const requestData = {
                method: 'GET',
                path: '/api/test',
                data: { shouldBeIgnored: true }
            };

            await apiClient.executeRequest(mockService, requestData);

            expect(mockedAxios).toHaveBeenCalledWith({
                method: 'get',
                url: 'http://localhost:3001/api/test',
                headers: {},
                timeout: 10000
            });
        });

        it('should handle axios errors', async () => {
            const mockError = new Error('Network Error');
            mockError.response = {
                status: 500,
                statusText: 'Internal Server Error',
                data: { error: 'Something went wrong' }
            };

            mockedAxios.mockRejectedValue(mockError);

            const requestData = {
                method: 'GET',
                path: '/api/test'
            };

            const result = await apiClient.executeRequest(mockService, requestData);

            expect(result).toEqual({
                error: 'Network Error',
                status: 500,
                statusText: 'Internal Server Error',
                data: { error: 'Something went wrong' }
            });
        });

        it('should handle axios errors without response', async () => {
            const mockError = new Error('Network Error');
            mockedAxios.mockRejectedValue(mockError);

            const requestData = {
                method: 'GET',
                path: '/api/test'
            };

            const result = await apiClient.executeRequest(mockService, requestData);

            expect(result).toEqual({
                error: 'Network Error',
                status: undefined,
                statusText: undefined,
                data: undefined
            });
        });

        it('should throw error when service is null', async () => {
            const requestData = {
                method: 'GET',
                path: '/api/test'
            };

            await expect(apiClient.executeRequest(null, requestData))
                .rejects.toThrow('Service not found');
        });

        it('should throw error when method is missing', async () => {
            const requestData = {
                path: '/api/test'
            };

            await expect(apiClient.executeRequest(mockService, requestData))
                .rejects.toThrow('Method and path are required');
        });

        it('should throw error when path is missing', async () => {
            const requestData = {
                method: 'GET'
            };

            await expect(apiClient.executeRequest(mockService, requestData))
                .rejects.toThrow('Method and path are required');
        });
    });

    describe('shouldIncludeData', () => {
        it('should return true for POST method', () => {
            expect(apiClient.shouldIncludeData('POST')).toBe(true);
        });

        it('should return true for PUT method', () => {
            expect(apiClient.shouldIncludeData('PUT')).toBe(true);
        });

        it('should return true for PATCH method', () => {
            expect(apiClient.shouldIncludeData('PATCH')).toBe(true);
        });

        it('should return false for GET method', () => {
            expect(apiClient.shouldIncludeData('GET')).toBe(false);
        });

        it('should return false for DELETE method', () => {
            expect(apiClient.shouldIncludeData('DELETE')).toBe(false);
        });

        it('should handle case insensitive methods', () => {
            expect(apiClient.shouldIncludeData('post')).toBe(true);
            expect(apiClient.shouldIncludeData('get')).toBe(false);
        });
    });

    describe('validateRequest', () => {
        it('should validate correct request data', () => {
            const requestData = {
                method: 'GET',
                path: '/api/test'
            };

            const validation = apiClient.validateRequest(requestData);
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        it('should reject request without method', () => {
            const requestData = {
                path: '/api/test'
            };

            const validation = apiClient.validateRequest(requestData);
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Method is required');
        });

        it('should reject request without path', () => {
            const requestData = {
                method: 'GET'
            };

            const validation = apiClient.validateRequest(requestData);
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Path is required');
        });

        it('should reject invalid HTTP method', () => {
            const requestData = {
                method: 'INVALID',
                path: '/api/test'
            };

            const validation = apiClient.validateRequest(requestData);
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Invalid HTTP method');
        });

        it('should reject path not starting with /', () => {
            const requestData = {
                method: 'GET',
                path: 'api/test'
            };

            const validation = apiClient.validateRequest(requestData);
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Path must start with /');
        });

        it('should accept all valid HTTP methods', () => {
            const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
            
            validMethods.forEach(method => {
                const requestData = {
                    method,
                    path: '/api/test'
                };

                const validation = apiClient.validateRequest(requestData);
                expect(validation.isValid).toBe(true);
            });
        });

        it('should collect multiple validation errors', () => {
            const requestData = {
                method: 'INVALID',
                path: 'invalid-path'
            };

            const validation = apiClient.validateRequest(requestData);
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(2);
        });
    });

    describe('constructor', () => {
        it('should use default timeout when not provided', () => {
            const client = new ApiClient();
            expect(client.timeout).toBe(10000);
        });

        it('should use custom timeout when provided', () => {
            const client = new ApiClient(5000);
            expect(client.timeout).toBe(5000);
        });
    });
});
