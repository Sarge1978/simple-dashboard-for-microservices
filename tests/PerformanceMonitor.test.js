const PerformanceMonitor = require('../src/services/PerformanceMonitor');

describe('PerformanceMonitor', () => {
    let performanceMonitor;
    let mockReq, mockRes;

    beforeEach(() => {
        performanceMonitor = new PerformanceMonitor(); // Don't auto-start for tests
        
        mockReq = {
            method: 'GET',
            originalUrl: '/api/test',
            ip: '127.0.0.1',
            get: jest.fn().mockReturnValue('test-user-agent')
        };

        mockRes = {
            statusCode: 200
        };

        jest.clearAllMocks();
    });

    afterEach(() => {
        // Clean up intervals to prevent Jest hanging
        if (performanceMonitor.systemMonitorInterval) {
            clearInterval(performanceMonitor.systemMonitorInterval);
            performanceMonitor.systemMonitorInterval = null;
        }
        if (performanceMonitor.dataCleanupInterval) {
            clearInterval(performanceMonitor.dataCleanupInterval);
            performanceMonitor.dataCleanupInterval = null;
        }
        if (performanceMonitor.stopMonitoring) {
            performanceMonitor.stopMonitoring();
        }
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            expect(performanceMonitor).toBeDefined();
            expect(performanceMonitor.metrics).toBeDefined();
            expect(performanceMonitor.metrics.requests).toEqual([]);
            expect(performanceMonitor.metrics.serviceHealth).toEqual([]);
            expect(performanceMonitor.metrics.systemMetrics).toEqual([]);
            expect(performanceMonitor.requestCount).toBe(0);
            expect(performanceMonitor.errorCount).toBe(0);
        });

        it('should initialize metrics structure', () => {
            expect(performanceMonitor.metrics.apiUsage).toBeInstanceOf(Map);
            expect(performanceMonitor.metrics.errorRates).toBeInstanceOf(Map);
            expect(performanceMonitor.metrics.responseTimeHistory).toBeInstanceOf(Map);
            expect(performanceMonitor.startTime).toBeDefined();
        });
    });

    describe('recordRequest', () => {
        it('should record successful request', () => {
            performanceMonitor.recordRequest(mockReq, mockRes, 100);
            
            expect(performanceMonitor.metrics.requests).toHaveLength(1);
            expect(performanceMonitor.requestCount).toBe(1);
            expect(performanceMonitor.errorCount).toBe(0);
            
            const request = performanceMonitor.metrics.requests[0];
            expect(request.method).toBe('GET');
            expect(request.url).toBe('/api/test');
            expect(request.statusCode).toBe(200);
            expect(request.responseTime).toBe(100);
        });

        it('should record failed request', () => {
            const error = new Error('Test error');
            performanceMonitor.recordRequest(mockReq, mockRes, 500, error);
            
            expect(performanceMonitor.requestCount).toBe(1);
            expect(performanceMonitor.errorCount).toBe(1);
            
            const request = performanceMonitor.metrics.requests[0];
            expect(request.error).toBe('Test error');
        });

        it('should track API usage statistics', () => {
            performanceMonitor.recordRequest(mockReq, mockRes, 100);
            performanceMonitor.recordRequest(mockReq, mockRes, 200);
            
            const endpoint = 'GET /api/test';
            const apiStats = performanceMonitor.metrics.apiUsage.get(endpoint);
            
            expect(apiStats).toBeDefined();
            expect(apiStats.count).toBe(2);
            expect(apiStats.totalResponseTime).toBe(300);
            expect(apiStats.errors).toBe(0);
        });

        it('should handle malformed request objects', () => {
            const malformedReq = {
                method: 'GET',
                originalUrl: '/api/test'
                // Missing other properties
            };
            
            expect(() => {
                performanceMonitor.recordRequest(malformedReq, mockRes, 100);
            }).not.toThrow();
        });

        it('should handle missing response object', () => {
            expect(() => {
                performanceMonitor.recordRequest(mockReq, null, 100);
            }).not.toThrow();
        });
    });

    describe('recordServiceHealth', () => {
        it('should record service health metrics', () => {
            performanceMonitor.recordServiceHealth('service1', 'User Service', 'online', 50);
            
            expect(performanceMonitor.metrics.serviceHealth).toHaveLength(1);
            
            const health = performanceMonitor.metrics.serviceHealth[0];
            expect(health.serviceId).toBe('service1');
            expect(health.serviceName).toBe('User Service');
            expect(health.status).toBe('online');
            expect(health.responseTime).toBe(50);
        });
    });

    describe('getDashboardAnalytics', () => {
        beforeEach(() => {
            // Add some test data
            performanceMonitor.recordRequest(mockReq, mockRes, 100);
            performanceMonitor.recordRequest(mockReq, mockRes, 200);
            performanceMonitor.recordServiceHealth('service1', 'User Service', 'online', 50);
        });

        it('should return complete analytics', () => {
            const analytics = performanceMonitor.getDashboardAnalytics();
            
            expect(analytics).toHaveProperty('overview');
            expect(analytics).toHaveProperty('apiUsage');
            expect(analytics).toHaveProperty('serviceHealth');
            expect(analytics).toHaveProperty('errorAnalysis');
            expect(analytics).toHaveProperty('performanceTrends');
            expect(analytics).toHaveProperty('topEndpoints');
        });

        it('should calculate overview metrics correctly', () => {
            const analytics = performanceMonitor.getDashboardAnalytics();
            const overview = analytics.overview;
            
            expect(overview.totalRequests).toBe(2);
            expect(overview.averageResponseTime).toBe(150); // (100 + 200) / 2
            expect(overview.errorRate).toBe(0);
            expect(overview.uptime).toBeDefined();
        });
    });

    describe('parseTimeRange', () => {
        it('should parse time ranges correctly', () => {
            expect(performanceMonitor.parseTimeRange('5m')).toBe(5 * 60 * 1000);
            expect(performanceMonitor.parseTimeRange('15m')).toBe(15 * 60 * 1000);
            expect(performanceMonitor.parseTimeRange('1h')).toBe(60 * 60 * 1000);
            expect(performanceMonitor.parseTimeRange('24h')).toBe(24 * 60 * 60 * 1000);
            expect(performanceMonitor.parseTimeRange('1d')).toBe(24 * 60 * 60 * 1000);
            expect(performanceMonitor.parseTimeRange('7d')).toBe(7 * 24 * 60 * 60 * 1000);
        });

        it('should default to 1 hour for invalid ranges', () => {
            expect(performanceMonitor.parseTimeRange('invalid')).toBe(60 * 60 * 1000);
            expect(performanceMonitor.parseTimeRange('')).toBe(60 * 60 * 1000);
            expect(performanceMonitor.parseTimeRange(null)).toBe(60 * 60 * 1000);
        });
    });

    describe('system monitoring', () => {
        it('should start system monitoring', () => {
            performanceMonitor.startSystemMonitoring();
            expect(performanceMonitor.systemMonitorInterval).toBeDefined();
            
            // Clean up immediately
            if (performanceMonitor.stopSystemMonitoring) {
                performanceMonitor.stopSystemMonitoring();
            }
        });

        it('should provide current system metrics', () => {
            const metrics = performanceMonitor.getCurrentSystemMetrics();
            
            expect(metrics).toHaveProperty('memoryUsage');
            expect(metrics).toHaveProperty('cpuUsage');
            expect(metrics).toHaveProperty('uptime');
            expect(metrics).toHaveProperty('processId');
            expect(metrics).toHaveProperty('version');
            expect(metrics).toHaveProperty('timestamp');
        });
    });
});
