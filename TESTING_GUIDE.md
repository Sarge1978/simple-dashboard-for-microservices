# Dashboard Testing Guide

## Prerequisites
1. Ensure all services are running:
   - Main dashboard: http://localhost:3000
   - User service: http://localhost:3001
   - Product service: http://localhost:3002
   - Order service: http://localhost:3003

## Manual Testing Checklist

### 1. Dashboard Load Test
- [ ] Open http://localhost:3000 in browser
- [ ] Verify dashboard loads without errors
- [ ] Check that all sections are visible
- [ ] Verify modern, professional styling

### 2. Authentication Test
- [ ] Click "Login" button in header
- [ ] Modal should open with clean, modern styling
- [ ] Try admin login: username="admin", password="admin123"
- [ ] Should see welcome message and user info in header
- [ ] Try user login: username="user", password="user123"
- [ ] Try invalid credentials - should show error
- [ ] Test logout functionality

### 3. Collapsible Sections Test
- [ ] Verify all sections except header are collapsible:
  - Performance Analytics
  - Microservices Status
  - API Tester
  - Activity Logs
- [ ] Click section headers to collapse/expand
- [ ] Verify smooth animations and consistent styling
- [ ] Check that collapsed sections hide content properly

### 4. Performance Analytics Test (Requires Login)
- [ ] Login as admin
- [ ] Expand Performance Analytics section
- [ ] Verify metrics are displayed:
  - Total Requests
  - Average Response Time
  - Success Rate
  - Top Endpoints
- [ ] Check that metrics update as you use the dashboard
- [ ] Test refresh functionality

### 5. Microservices Status Test
- [ ] Expand Microservices Status section
- [ ] Should see 3 services listed:
  - User Service (port 3001)
  - Product Service (port 3002)
  - Order Service (port 3003)
- [ ] Services should show "Online" status (green)
- [ ] Click "Test" button on each service
- [ ] Click "View Details" for service information

### 6. API Tester Test
- [ ] Expand API Tester section
- [ ] Test GET request to http://localhost:3001/users
- [ ] Test POST request with JSON body
- [ ] Verify response is displayed properly
- [ ] Test different HTTP methods
- [ ] Test error scenarios (invalid URLs)

### 7. Activity Logs Test
- [ ] Expand Activity Logs section
- [ ] Should see real-time log entries
- [ ] Logs should show different colors for different log levels:
  - Blue: Info
  - Green: Success
  - Red: Error
  - Orange: Warning
- [ ] Verify timestamps are shown
- [ ] Test that logs update as you interact with dashboard

### 8. Responsive Design Test
- [ ] Resize browser window to mobile width
- [ ] Verify layout adapts properly
- [ ] Check that all functionality still works on mobile
- [ ] Test modal on mobile devices

### 9. Error Handling Test
- [ ] Stop one of the microservices
- [ ] Verify dashboard shows service as "Offline"
- [ ] Test API calls to stopped service
- [ ] Verify proper error messages

### 10. UI Consistency Test
- [ ] Verify all sections have consistent styling:
  - Same background color/transparency
  - Same border radius
  - Same padding and margins
  - Same typography
- [ ] Check buttons have consistent hover effects
- [ ] Verify color scheme is consistent throughout

## Expected Results
- ✅ All sections should have white/transparent background
- ✅ Smooth animations and transitions
- ✅ Professional, modern appearance
- ✅ Authentication should work for both admin and user
- ✅ Real-time updates for logs and metrics
- ✅ All microservices should be detected and responsive
- ✅ API tester should handle various request types
- ✅ Mobile-responsive design

## Common Issues to Check
- [ ] Login modal inputs have proper styling
- [ ] No conflicting CSS causing layout issues
- [ ] All sections expand/collapse smoothly
- [ ] Activity Logs section matches other section styling
- [ ] Performance analytics loads correctly after login
- [ ] JWT tokens are handled properly
- [ ] CORS issues resolved
- [ ] Dependencies are installed correctly

## API Endpoints to Test Manually
```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Analytics (with token)
curl http://localhost:3000/api/analytics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Services list
curl http://localhost:3000/api/services

# Test microservices
curl http://localhost:3001/users
curl http://localhost:3002/products
curl http://localhost:3003/orders
```

## Screenshot Areas for Documentation
1. Dashboard overview with all sections visible
2. Login modal
3. Performance analytics section (logged in)
4. Microservices status showing all services online
5. API tester with sample request/response
6. Activity logs with colored log entries
7. Mobile responsive view
8. Collapsed vs expanded sections

## Unit Test Coverage

### Running Unit Tests
```bash
# Run all unit tests
npm test

# Run specific test files
npm test -- tests/AuthService.test.js
npm test -- tests/PerformanceMonitor.test.js

# Run tests with coverage report
npm run test:coverage

# Force exit tests if hanging
npm test -- --forceExit

# Detect open handles causing hanging
npm test -- --detectOpenHandles
```

### Current Test Coverage
- ✅ AuthService: Authentication, token validation, user management
- ✅ PerformanceMonitor: Request tracking, metrics calculation, system monitoring
- ✅ HealthChecker: Service health monitoring and reporting
- ✅ ServiceManager: Service discovery and management
- ✅ ApiClient: HTTP client functionality and error handling
- ✅ Utils: Utility functions and helpers

### Jest Issues and Solutions
If Jest hangs after test completion:
1. **Use --forceExit**: `npm test -- --forceExit`
2. **Check for open handles**: `npm test -- --detectOpenHandles`
3. **Common causes**: Unclosed intervals, timeouts, database connections
4. **Fixed in our codebase**: 
   - PerformanceMonitor intervals properly cleaned up
   - Fake timers used in tests
   - Proper afterEach cleanup hooks

## Summary of Jest Issue Resolution

### Issues Identified and Fixed
1. **Open handles from setInterval**: Fixed PerformanceMonitor constructor to not auto-start intervals during tests
2. **Improper cleanup**: Added comprehensive afterEach cleanup in all test files
3. **Error handling**: Fixed PerformanceMonitor.recordRequest to handle malformed req/res objects
4. **Time range parsing**: Added missing '1d' and '7d' time ranges
5. **System metrics structure**: Updated getCurrentSystemMetrics to match expected test structure

### Test Files Created/Updated
- `tests/AuthService.test.js`: Complete unit test coverage for authentication
- `tests/PerformanceMonitor.test.js`: Complete unit test coverage for performance monitoring
- Both files include proper cleanup and error handling

### Key Fixes Applied
- PerformanceMonitor constructor now accepts `autoStart` parameter (default false for tests)
- Added `stopSystemMonitoring()` and proper interval cleanup methods
- Used fake timers in tests to prevent async hanging
- Fixed request object property access with proper fallbacks
- Updated system metrics to include all expected properties

### Test Execution
```bash
# Recommended way to run tests (prevents hanging)
npm test -- --forceExit

# For debugging open handles
npm test -- --detectOpenHandles --forceExit

# Run specific test suites
npm test -- tests/AuthService.test.js --forceExit
npm test -- tests/PerformanceMonitor.test.js --forceExit
```
