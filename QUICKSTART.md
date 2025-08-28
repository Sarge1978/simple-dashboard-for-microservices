# 🚀 Quick Start - Simple Dashboard for Microservices

## ✨ What You Get Out of the Box

### 1. 📊 Production-Ready Dashboard (Port 3000)
- **URL**: http://localhost:3000
- **Features**:
  - 🔄 Real-time microservices monitoring with WebSocket updates
  - 🧪 Built-in API testing tool with full HTTP method support
  - ⚡ Automatic health checks every 30 seconds
  - 📱 Responsive design that works on all devices
  - 📊 Service statistics and performance metrics
  - 🛡️ Built-in security with rate limiting and CORS
  - 📝 Comprehensive activity logging

### 2. 🏭 Enterprise-Grade Example Microservices
Three fully-featured services demonstrating best practices:

#### 👤 User Service (Port 3001) - 100% Test Coverage
**Modern API Endpoints:**
- `GET /api/users` - Get all users with filtering
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user (supports phone field)
- `PUT /api/users/:id` - Update user information
- `DELETE /api/users/:id` - Delete user account

**Legacy Endpoints (backward compatibility):**
- `GET /users`, `POST /users`, etc.

**Health & Monitoring:**
- `GET /health` - Service health check
- `GET /ready` - Readiness probe

#### 🛍️ Product Service (Port 3002) - Enhanced with Validation
**Modern API Endpoints:**
- `GET /api/products` - Get products with advanced filtering
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product with validation
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product (204 status)

**Features:**
- Advanced input validation and error handling
- Proper HTTP status codes (404, 400, 405)
- Legacy endpoint support for backward compatibility

#### 📦 Order Service (Port 3003) - Workflow Management
**Modern API Endpoints:**
- `GET /api/orders` - Get orders with status filtering
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order with user validation
- `PUT /api/orders/:id` - Update order status with workflow validation
- `DELETE /api/orders/:id` - Cancel order
- `GET /api/stats` - Comprehensive order analytics

**Advanced Features:**
- Order status workflow (pending → processing → shipped → delivered)
- Cross-service user validation
- Comprehensive statistics and reporting

## 🏃 Getting Started (2 Minutes)

### Option 1: Quick Start Script
```bash
# Start dashboard and all services at once
./start-services.sh

# Dashboard will be available at http://localhost:3000
# Services will start on ports 3001, 3002, 3003
```

### Option 2: Manual Step-by-Step
```bash
# Terminal 1: Start the dashboard
npm start

# Terminal 2: Start user service  
node examples/user-service.js

# Terminal 3: Start product service
node examples/product-service.js

# Terminal 4: Start order service
node examples/order-service.js
```

### Option 3: Docker Compose (Production-like)
```bash
# Start all services with Docker
docker-compose up

# Or run in background
docker-compose up -d
```

## ✅ Verification Steps

### 1. Check Dashboard
- Open http://localhost:3000
- You should see the dashboard with 3 services automatically detected
- All services should show 🟢 "Online" status

### 2. Test API Endpoints
**Test User Service:**
```bash
# Create a user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "phone": "+1234567890"}'

# Get all users
curl http://localhost:3001/api/users

# Test legacy endpoint (backward compatibility)
curl http://localhost:3001/users
```

**Test Product Service:**
```bash
# Create a product
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "price": 999.99, "category": "Electronics", "stock": 50}'

# Get products with filtering
curl "http://localhost:3002/api/products?category=Electronics"
```

**Test Order Service:**
```bash
# Create an order
curl -X POST http://localhost:3003/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "items": [{"productId": 1, "quantity": 2}]}'

# Get order statistics
curl http://localhost:3003/api/stats
```

### 3. Test Health Checks
```bash
# Check individual service health
curl http://localhost:3001/health
curl http://localhost:3002/health  
curl http://localhost:3003/health

# Check readiness
curl http://localhost:3001/ready
```

## 🧪 Run Tests (Quality Assurance)

### Full Test Suite
```bash
# Run all 191 tests
npm test

# Expected output: All tests passing ✅
# Test Suites: 12 passed, 12 total  
# Tests: 191 passed, 191 total
```

### Individual Test Suites
```bash
# Test specific services
npm test -- tests/user-service.test.js      # 24 tests
npm test -- tests/product-service.test.js   # 23 tests  
npm test -- tests/order-service.test.js     # 19 tests

# Test end-to-end workflows
npm test -- tests/e2e.test.js              # 12 tests

# Test security and validation
npm test -- tests/security.test.js         # 13 tests
```

## 🎯 Next Steps

### 1. Explore the Dashboard Features
- **Service Management**: Add your own services through the web interface
- **API Testing**: Use the built-in API tester to explore endpoints
- **Real-time Monitoring**: Watch services go online/offline in real-time
- **Activity Logs**: Monitor all API calls and system events

### 2. Add Your Own Services
```javascript
// Example: Add your service to the dashboard
// It will be automatically discovered if it has /health endpoint
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'my-custom-service',
        timestamp: new Date().toISOString()
    });
});

app.listen(3004, () => {
    console.log('My service running on port 3004');
});
```

### 3. Explore Advanced Features
- **Modern API Design**: Check `/api/...` endpoints vs legacy routes
- **Error Handling**: Try invalid requests to see proper error responses
- **Backward Compatibility**: Test both modern and legacy endpoints
- **Health Monitoring**: Observe automatic health checks every 30 seconds

### 4. Customization Options
```bash
# Environment variables for customization
PORT=3000                    # Dashboard port
HEALTH_CHECK_INTERVAL=30000  # Health check frequency (ms)
REQUEST_TIMEOUT=5000         # Request timeout (ms)
RATE_LIMIT_MAX=100          # Rate limit per window
```

### 5. Production Deployment
```bash
# Build for production
npm run build

# Deploy with Docker
docker build -t my-dashboard .
docker run -p 3000:3000 my-dashboard

# Or use Docker Compose for full stack
docker-compose -f docker-compose.prod.yml up
```

## 🎉 What You've Accomplished

✅ **Deployed a production-ready microservices dashboard**  
✅ **Started 3 fully-functional example services**  
✅ **Verified 100% test coverage (191/191 tests passing)**  
✅ **Experienced modern API design with backward compatibility**  
✅ **Set up real-time monitoring and health checks**  
✅ **Tested comprehensive error handling and validation**  

## 📚 Further Reading

- **[Complete Documentation](README.md)** - Full feature documentation
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[API Documentation](README.md#-api-documentation)** - Detailed API reference

## 🆘 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using the port
lsof -i :3000
# Kill the process and restart
```

**Services not detected:**
- Ensure services have `/health` endpoints
- Check service URLs in dashboard configuration
- Verify CORS settings for cross-origin requests

**Tests failing:**
- Ensure no services are running during tests
- Check Node.js version (requires >=10.0.0)
- Run `npm install` to ensure dependencies are installed

**Need Help?**
- 🐛 [Report Issues](https://github.com/Sarge1978/simple-dashboard-for-microservices/issues)
- 💬 [Ask Questions](https://github.com/Sarge1978/simple-dashboard-for-microservices/discussions)
- 📖 [Read Full Documentation](README.md)

---

**🎉 Congratulations! Your microservices dashboard is up and running!**
