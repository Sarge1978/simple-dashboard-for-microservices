const Utils = require('../src/utils/Utils');

describe('Utils', () => {
    describe('formatTimestamp', () => {
        it('should format valid timestamp', () => {
            const timestamp = '2025-08-28T12:00:00Z';
            const result = Utils.formatTimestamp(timestamp);
            expect(typeof result).toBe('string');
            expect(result).not.toBe('N/A');
        });

        it('should return N/A for null timestamp', () => {
            expect(Utils.formatTimestamp(null)).toBe('N/A');
            expect(Utils.formatTimestamp(undefined)).toBe('N/A');
        });

        it('should return Invalid Date for invalid timestamp', () => {
            expect(Utils.formatTimestamp('invalid')).toBe('Invalid Date');
        });
    });

    describe('isValidUrl', () => {
        it('should validate correct URLs', () => {
            expect(Utils.isValidUrl('http://localhost:3000')).toBe(true);
            expect(Utils.isValidUrl('https://example.com')).toBe(true);
            expect(Utils.isValidUrl('http://192.168.1.1:8080')).toBe(true);
        });

        it('should reject invalid URLs', () => {
            expect(Utils.isValidUrl('invalid-url')).toBe(false);
            expect(Utils.isValidUrl('')).toBe(false);
            expect(Utils.isValidUrl('not-a-url')).toBe(false);
        });
    });

    describe('sanitizeHtml', () => {
        it('should escape HTML entities', () => {
            const malicious = '<script>alert("xss")</script>';
            const sanitized = Utils.sanitizeHtml(malicious);
            expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        });

        it('should handle empty or non-string input', () => {
            expect(Utils.sanitizeHtml('')).toBe('');
            expect(Utils.sanitizeHtml(null)).toBe('');
            expect(Utils.sanitizeHtml(undefined)).toBe('');
            expect(Utils.sanitizeHtml(123)).toBe('');
        });
    });

    describe('formatBytes', () => {
        it('should format bytes correctly', () => {
            expect(Utils.formatBytes(0)).toBe('0 Bytes');
            expect(Utils.formatBytes(1024)).toBe('1 KB');
            expect(Utils.formatBytes(1048576)).toBe('1 MB');
            expect(Utils.formatBytes(1073741824)).toBe('1 GB');
        });

        it('should handle decimal places', () => {
            expect(Utils.formatBytes(1536, 1)).toBe('1.5 KB');
            expect(Utils.formatBytes(1536, 0)).toBe('2 KB');
        });
    });

    describe('debounce', () => {
        it('should delay function execution', (done) => {
            let callCount = 0;
            const fn = () => callCount++;
            const debouncedFn = Utils.debounce(fn, 100);

            debouncedFn();
            debouncedFn();
            debouncedFn();

            expect(callCount).toBe(0);

            setTimeout(() => {
                expect(callCount).toBe(1);
                done();
            }, 150);
        });

        it('should execute immediately when immediate flag is set', () => {
            let callCount = 0;
            const fn = () => callCount++;
            const debouncedFn = Utils.debounce(fn, 100, true);

            debouncedFn();
            expect(callCount).toBe(1);

            debouncedFn();
            expect(callCount).toBe(1);
        });
    });

    describe('throttle', () => {
        it('should limit function calls', (done) => {
            let callCount = 0;
            const fn = () => callCount++;
            const throttledFn = Utils.throttle(fn, 100);

            throttledFn();
            throttledFn();
            throttledFn();

            expect(callCount).toBe(1);

            setTimeout(() => {
                throttledFn();
                expect(callCount).toBe(2);
                done();
            }, 150);
        });
    });

    describe('generateId', () => {
        it('should generate unique IDs', () => {
            const id1 = Utils.generateId();
            const id2 = Utils.generateId();
            
            expect(typeof id1).toBe('string');
            expect(typeof id2).toBe('string');
            expect(id1).not.toBe(id2);
            expect(id1.length).toBeGreaterThan(0);
        });
    });

    describe('deepClone', () => {
        it('should clone primitive values', () => {
            expect(Utils.deepClone(null)).toBe(null);
            expect(Utils.deepClone(undefined)).toBe(undefined);
            expect(Utils.deepClone(42)).toBe(42);
            expect(Utils.deepClone('test')).toBe('test');
            expect(Utils.deepClone(true)).toBe(true);
        });

        it('should clone objects', () => {
            const obj = { a: 1, b: { c: 2 } };
            const cloned = Utils.deepClone(obj);
            
            expect(cloned).toEqual(obj);
            expect(cloned).not.toBe(obj);
            expect(cloned.b).not.toBe(obj.b);
        });

        it('should clone arrays', () => {
            const arr = [1, 2, { a: 3 }];
            const cloned = Utils.deepClone(arr);
            
            expect(cloned).toEqual(arr);
            expect(cloned).not.toBe(arr);
            expect(cloned[2]).not.toBe(arr[2]);
        });

        it('should clone dates', () => {
            const date = new Date();
            const cloned = Utils.deepClone(date);
            
            expect(cloned).toEqual(date);
            expect(cloned).not.toBe(date);
        });
    });

    describe('validateJson', () => {
        it('should validate correct JSON', () => {
            const result = Utils.validateJson('{"name": "test"}');
            expect(result.valid).toBe(true);
            expect(result.error).toBe(null);
        });

        it('should reject invalid JSON', () => {
            const result = Utils.validateJson('{invalid json}');
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('formatDuration', () => {
        it('should format milliseconds', () => {
            expect(Utils.formatDuration(500)).toBe('500ms');
            expect(Utils.formatDuration(1500)).toBe('1.5s');
            expect(Utils.formatDuration(65000)).toBe('1.1m');
            expect(Utils.formatDuration(3665000)).toBe('1.0h');
        });
    });

    describe('getStatusColor', () => {
        it('should return correct colors for status', () => {
            expect(Utils.getStatusColor('online')).toBe('#4CAF50');
            expect(Utils.getStatusColor('offline')).toBe('#F44336');
            expect(Utils.getStatusColor('unknown')).toBe('#FF9800');
            expect(Utils.getStatusColor('invalid')).toBe('#FF9800');
        });
    });

    describe('retry', () => {
        it('should resolve on successful execution', async () => {
            const successFn = jest.fn().mockResolvedValue('success');
            const result = await Utils.retry(successFn);
            
            expect(result).toBe('success');
            expect(successFn).toHaveBeenCalledTimes(1);
        });

        it('should retry on failure', async () => {
            const failFn = jest.fn()
                .mockRejectedValueOnce(new Error('fail 1'))
                .mockRejectedValueOnce(new Error('fail 2'))
                .mockResolvedValue('success');
            
            const result = await Utils.retry(failFn, 3, 10);
            
            expect(result).toBe('success');
            expect(failFn).toHaveBeenCalledTimes(3);
        });

        it('should reject after max attempts', async () => {
            const failFn = jest.fn().mockRejectedValue(new Error('always fails'));
            
            await expect(Utils.retry(failFn, 2, 10)).rejects.toThrow('always fails');
            expect(failFn).toHaveBeenCalledTimes(2);
        });
    });
});
