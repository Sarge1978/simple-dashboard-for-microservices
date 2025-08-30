// Using built-in setInterval instead of node-cron for better compatibility

class PerformanceMonitor {
    constructor(autoStart = false) {
        this.metrics = {
            requests: [],
            serviceHealth: [],
            systemMetrics: [],
            apiUsage: new Map(),
            errorRates: new Map(),
            responseTimeHistory: new Map()
        };
        
        this.startTime = Date.now();
        this.requestCount = 0;
        this.errorCount = 0;
        
        // Only start monitoring tasks if autoStart is true
        if (autoStart) {
            this.startSystemMonitoring();
            this.startDataCleanup();
        }
    }

    // Record API request metrics
    recordRequest(req, res, responseTime, error = null) {
        try {
            const timestamp = new Date();
            const endpoint = `${req.method || 'UNKNOWN'} ${req.originalUrl || req.url || '/'}`;
            
            this.requestCount++;
            if (error) this.errorCount++;

            const requestMetric = {
                timestamp,
                method: req.method || 'UNKNOWN',
                url: req.originalUrl || req.url || '/',
                statusCode: res ? res.statusCode : 500,
                responseTime: typeof responseTime === 'number' ? responseTime : 0,
                userAgent: req.get ? req.get('User-Agent') : req.headers ? req.headers['user-agent'] : 'Unknown',
                ip: req.ip || (req.connection && req.connection.remoteAddress) || 'Unknown',
                error: error ? error.message : null,
                userId: req.user ? req.user.id : null
            };

            this.metrics.requests.push(requestMetric);

            // Update API usage statistics
            if (!this.metrics.apiUsage.has(endpoint)) {
                this.metrics.apiUsage.set(endpoint, {
                    count: 0,
                    totalResponseTime: 0,
                    errors: 0,
                lastUsed: timestamp
            });
        }

        const apiStat = this.metrics.apiUsage.get(endpoint);
        apiStat.count++;
        apiStat.totalResponseTime += requestMetric.responseTime;
        apiStat.lastUsed = timestamp;
        if (error) apiStat.errors++;

        // Update response time history
        if (!this.metrics.responseTimeHistory.has(endpoint)) {
            this.metrics.responseTimeHistory.set(endpoint, []);
        }
        this.metrics.responseTimeHistory.get(endpoint).push({
            timestamp,
            responseTime: requestMetric.responseTime
        });

        // Calculate error rate
        const errorRate = (apiStat.errors / apiStat.count) * 100;
        this.metrics.errorRates.set(endpoint, errorRate);

        // Keep only last 1000 requests to prevent memory issues
        if (this.metrics.requests.length > 1000) {
            this.metrics.requests = this.metrics.requests.slice(-1000);
        }
        } catch (err) {
            console.error('Error recording request metrics:', err);
        }
    }

    // Record service health metrics
    recordServiceHealth(serviceId, serviceName, status, responseTime, timestamp = new Date()) {
        const healthMetric = {
            timestamp,
            serviceId,
            serviceName,
            status,
            responseTime
        };

        this.metrics.serviceHealth.push(healthMetric);

        // Keep only last 1000 health checks per service
        if (this.metrics.serviceHealth.length > 5000) {
            this.metrics.serviceHealth = this.metrics.serviceHealth.slice(-5000);
        }
    }

    // Get dashboard analytics
    getDashboardAnalytics(timeRange = '1h') {
        const now = new Date();
        const timeRangeMs = this.parseTimeRange(timeRange);
        const fromTime = new Date(now.getTime() - timeRangeMs);

        const filteredRequests = this.metrics.requests.filter(
            req => req.timestamp >= fromTime
        );

        const filteredHealthChecks = this.metrics.serviceHealth.filter(
            health => health.timestamp >= fromTime
        );

        return {
            overview: this.getOverviewMetrics(filteredRequests),
            apiUsage: this.getApiUsageMetrics(filteredRequests),
            serviceHealth: this.getServiceHealthMetrics(filteredHealthChecks),
            errorAnalysis: this.getErrorAnalysis(filteredRequests),
            performanceTrends: this.getPerformanceTrends(filteredRequests),
            topEndpoints: this.getTopEndpoints(filteredRequests),
            systemMetrics: this.getCurrentSystemMetrics()
        };
    }

    // Get overview metrics
    getOverviewMetrics(requests) {
        const totalRequests = requests.length;
        const errors = requests.filter(req => req.error || req.statusCode >= 400).length;
        const errorRate = totalRequests > 0 ? (errors / totalRequests) * 100 : 0;
        
        const responseTimes = requests.map(req => req.responseTime).filter(rt => rt !== undefined);
        const avgResponseTime = responseTimes.length > 0 
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
            : 0;

        const uptime = Date.now() - this.startTime;

        return {
            totalRequests,
            errorCount: errors,
            errorRate: Math.round(errorRate * 100) / 100,
            averageResponseTime: Math.round(avgResponseTime * 100) / 100,
            uptime: Math.round(uptime / 1000), // in seconds
            requestsPerMinute: totalRequests > 0 ? Math.round((totalRequests / (uptime / 60000)) * 100) / 100 : 0
        };
    }

    // Get API usage metrics
    getApiUsageMetrics(requests) {
        const endpointStats = new Map();

        requests.forEach(req => {
            const endpoint = `${req.method} ${req.url}`;
            if (!endpointStats.has(endpoint)) {
                endpointStats.set(endpoint, {
                    method: req.method,
                    url: req.url,
                    count: 0,
                    totalResponseTime: 0,
                    errors: 0
                });
            }

            const stat = endpointStats.get(endpoint);
            stat.count++;
            stat.totalResponseTime += req.responseTime || 0;
            if (req.error || req.statusCode >= 400) stat.errors++;
        });

        return Array.from(endpointStats.values()).map(stat => ({
            ...stat,
            averageResponseTime: stat.count > 0 ? Math.round((stat.totalResponseTime / stat.count) * 100) / 100 : 0,
            errorRate: stat.count > 0 ? Math.round((stat.errors / stat.count) * 100 * 100) / 100 : 0
        })).sort((a, b) => b.count - a.count);
    }

    // Get service health metrics
    getServiceHealthMetrics(healthChecks) {
        const serviceStats = new Map();

        healthChecks.forEach(health => {
            if (!serviceStats.has(health.serviceId)) {
                serviceStats.set(health.serviceId, {
                    serviceId: health.serviceId,
                    serviceName: health.serviceName,
                    checks: 0,
                    uptime: 0,
                    totalResponseTime: 0,
                    lastStatus: 'unknown'
                });
            }

            const stat = serviceStats.get(health.serviceId);
            stat.checks++;
            stat.totalResponseTime += health.responseTime || 0;
            stat.lastStatus = health.status;
            if (health.status === 'online') stat.uptime++;
        });

        return Array.from(serviceStats.values()).map(stat => ({
            ...stat,
            uptimePercentage: stat.checks > 0 ? Math.round((stat.uptime / stat.checks) * 100 * 100) / 100 : 0,
            averageResponseTime: stat.checks > 0 ? Math.round((stat.totalResponseTime / stat.checks) * 100) / 100 : 0
        }));
    }

    // Get error analysis
    getErrorAnalysis(requests) {
        const errors = requests.filter(req => req.error || req.statusCode >= 400);
        const errorsByType = new Map();
        const errorsByEndpoint = new Map();

        errors.forEach(error => {
            // Group by status code
            const statusCode = error.statusCode || 500;
            errorsByType.set(statusCode, (errorsByType.get(statusCode) || 0) + 1);

            // Group by endpoint
            const endpoint = `${error.method} ${error.url}`;
            errorsByEndpoint.set(endpoint, (errorsByEndpoint.get(endpoint) || 0) + 1);
        });

        return {
            totalErrors: errors.length,
            errorsByType: Array.from(errorsByType.entries()).map(([code, count]) => ({ statusCode: code, count })),
            errorsByEndpoint: Array.from(errorsByEndpoint.entries()).map(([endpoint, count]) => ({ endpoint, count }))
                .sort((a, b) => b.count - a.count).slice(0, 10)
        };
    }

    // Get performance trends
    getPerformanceTrends(requests) {
        const intervals = this.groupByTimeInterval(requests, 5); // 5-minute intervals
        return intervals.map(interval => ({
            timestamp: interval.timestamp,
            requestCount: interval.requests.length,
            averageResponseTime: this.calculateAverageResponseTime(interval.requests),
            errorRate: this.calculateErrorRate(interval.requests)
        }));
    }

    // Get top endpoints by usage
    getTopEndpoints(requests) {
        const endpointCounts = new Map();
        
        requests.forEach(req => {
            const endpoint = `${req.method} ${req.url}`;
            endpointCounts.set(endpoint, (endpointCounts.get(endpoint) || 0) + 1);
        });

        return Array.from(endpointCounts.entries())
            .map(([endpoint, count]) => ({ endpoint, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    // Get current system metrics
    getCurrentSystemMetrics() {
        const memUsage = process.memoryUsage();
        return {
            memoryUsage: {
                rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100, // MB
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
                external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100 // MB
            },
            cpuUsage: process.cpuUsage ? process.cpuUsage() : { user: 0, system: 0 },
            uptime: Math.round(process.uptime()),
            processId: process.pid,
            version: process.version,
            timestamp: new Date()
        };
    }

    // Helper methods
    parseTimeRange(timeRange) {
        const timeRangeMap = {
            '5m': 5 * 60 * 1000,
            '15m': 15 * 60 * 1000,
            '1h': 60 * 60 * 1000,
            '6h': 6 * 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '1d': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000
        };
        return timeRangeMap[timeRange] || timeRangeMap['1h'];
    }

    groupByTimeInterval(requests, intervalMinutes) {
        const intervalMs = intervalMinutes * 60 * 1000;
        const groups = new Map();

        requests.forEach(req => {
            const intervalStart = Math.floor(req.timestamp.getTime() / intervalMs) * intervalMs;
            if (!groups.has(intervalStart)) {
                groups.set(intervalStart, {
                    timestamp: new Date(intervalStart),
                    requests: []
                });
            }
            groups.get(intervalStart).requests.push(req);
        });

        return Array.from(groups.values()).sort((a, b) => a.timestamp - b.timestamp);
    }

    calculateAverageResponseTime(requests) {
        const responseTimes = requests.map(req => req.responseTime).filter(rt => rt !== undefined);
        return responseTimes.length > 0 
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length * 100) / 100
            : 0;
    }

    calculateErrorRate(requests) {
        const errors = requests.filter(req => req.error || req.statusCode >= 400).length;
        return requests.length > 0 ? Math.round((errors / requests.length) * 100 * 100) / 100 : 0;
    }

    // Start system monitoring
    startSystemMonitoring() {
        // Stop existing interval if running
        if (this.systemMonitorInterval) {
            clearInterval(this.systemMonitorInterval);
        }
        
        // Collect system metrics every minute (60000 ms)
        this.systemMonitorInterval = setInterval(() => {
            const systemMetric = {
                timestamp: new Date(),
                ...this.getCurrentSystemMetrics()
            };
            
            this.metrics.systemMetrics.push(systemMetric);
            
            // Keep only last 1440 minutes (24 hours)
            if (this.metrics.systemMetrics.length > 1440) {
                this.metrics.systemMetrics = this.metrics.systemMetrics.slice(-1440);
            }
        }, 60000);
    }

    // Stop system monitoring
    stopSystemMonitoring() {
        if (this.systemMonitorInterval) {
            clearInterval(this.systemMonitorInterval);
            this.systemMonitorInterval = null;
        }
    }

    // Start data cleanup task
    startDataCleanup() {
        // Clean old data every hour (3600000 ms)
        this.cleanupInterval = setInterval(() => {
            const now = new Date();
            const cutoff = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago

            // Clean old requests
            this.metrics.requests = this.metrics.requests.filter(req => req.timestamp >= cutoff);
            
            // Clean old health checks
            this.metrics.serviceHealth = this.metrics.serviceHealth.filter(health => health.timestamp >= cutoff);
            
            // Clean old system metrics
            this.metrics.systemMetrics = this.metrics.systemMetrics.filter(metric => metric.timestamp >= cutoff);
        }, 3600000);
    }

    // Clear all metrics (for testing)
    clearMetrics() {
        this.metrics = {
            requests: [],
            serviceHealth: [],
            systemMetrics: [],
            apiUsage: new Map(),
            errorRates: new Map(),
            responseTimeHistory: new Map()
        };
        this.requestCount = 0;
        this.errorCount = 0;
    }

    // Stop monitoring (cleanup)
    stopMonitoring() {
        if (this.systemMonitorInterval) {
            clearInterval(this.systemMonitorInterval);
            this.systemMonitorInterval = null;
        }
        if (this.dataCleanupInterval) {
            clearInterval(this.dataCleanupInterval);
            this.dataCleanupInterval = null;
        }
    }
}

module.exports = PerformanceMonitor;
