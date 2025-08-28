# 🚀 Simple Dashboard for Microservices

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2010.0.0-brightgreen.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-191%20passing-brightgreen.svg)](package.json)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> A production-ready, modern web dashboard for monitoring and managing REST microservices with comprehensive testing and enterprise-grade features

![Dashboard Screenshot](https://via.placeholder.com/800x400/667eea/white?text=Simple+Dashboard+for+Microservices)

## ✨ Features

### 🎯 Core Functionality
- **📊 Real-time Dashboard** - Visual monitoring of all microservices with live status updates
- **🔍 API Testing Tool** - Built-in interface for testing service endpoints with full HTTP method support
- **⚡ Live Health Checks** - Automatic service monitoring every 30 seconds with WebSocket updates
- **🛠️ Service Management** - Easy addition, removal, and configuration of microservices
- **📝 Activity Logging** - Comprehensive tracking of all actions and events with color-coded levels
- **📱 Responsive Design** - Modern UI that works seamlessly on desktop, tablet, and mobile

### 🔧 Technical Features
- **🔄 Modern API Design** - RESTful APIs with `/api/...` prefix and backward compatibility
- **🛡️ Enterprise Security** - Rate limiting, CORS, input validation, and comprehensive error handling
- **🧪 100% Test Coverage** - Complete unit, integration, and E2E test suites (191/191 tests passing)
- **🌐 WebSocket Integration** - Real-time updates without page refresh
- **📊 Health Monitoring** - Advanced health checks with `/health` and `/ready` endpoints
- **🔄 Auto-discovery** - Automatic detection of service endpoints and capabilities
- **⚡ Performance Optimized** - Efficient request handling with proper HTTP status codes
- **🔧 Developer Experience** - Comprehensive documentation, examples, and setup guides

### 🚀 Production Features
- **🏭 Production Ready** - Tested, documented, and optimized for enterprise deployment
- **📦 Docker Support** - Complete containerization with Docker and Docker Compose
- **🔄 Backward Compatibility** - Support for both modern `/api/...` and legacy endpoints
- **📈 Monitoring & Observability** - Built-in metrics, logging, and health check systems
- **🛠️ CI/CD Ready** - Automated testing pipeline and deployment configurations

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 10.0.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sarge1978/simple-dashboard-for-microservices.git
   cd simple-dashboard-for-microservices
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the dashboard**
   ```bash
   npm start
   ```

4. **Launch example services** (optional)
   ```bash
   ./start-services.sh
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 Usage

### Dashboard Overview
The main dashboard provides a comprehensive view of your microservices ecosystem:

- **Service Cards**: Each service is displayed with its current status, URL, and available endpoints
- **Status Indicators**: 
  - 🟢 **Online** - Service is healthy and responding
  - 🔴 **Offline** - Service is unreachable or unhealthy  
  - 🟡 **Unknown** - Status not yet determined

### API Testing
Test your microservices directly from the dashboard:

1. Select a service from the dropdown
2. Choose HTTP method (GET, POST, PUT, DELETE, PATCH)
3. Enter the API path
4. Add headers and request body if needed
5. Click "Execute" to send the request

### Adding Your Services
1. Click "Add Service" button
2. Fill in service details:
   - **Name**: Display name for your service
   - **URL**: Base URL (e.g., `http://localhost:3001`)
   - **Description**: Brief description of the service
3. Save and start monitoring

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Browser   │◄──►│  Dashboard API   │◄──►│  Microservice   │
│   (Frontend)    │    │   (Backend)      │    │     Fleet       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                      │
         │              ┌────────▼────────┐             │
         │              │  WebSocket      │             │
         └─────────────►│  Real-time      │◄────────────┘
                        │  Updates        │
                        └─────────────────┘
```

## 📖 Example Services

The project includes three fully-featured example microservices to demonstrate functionality:

### 👤 User Service (Port 3001)
Manages user accounts and profiles with comprehensive CRUD operations

**Modern API Endpoints (`/api/...`):**
- `GET /api/users` - Get all users with optional filtering
- `GET /api/users/:id` - Get user by ID  
- `POST /api/users` - Create new user (with phone support)
- `PUT /api/users/:id` - Update user information
- `DELETE /api/users/:id` - Delete user account
- `GET /health` - Health check endpoint
- `GET /ready` - Readiness check endpoint

**Legacy Endpoints (for backward compatibility):**
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### 🛍️ Product Service (Port 3002)  
Handles product catalog and inventory management with advanced features

**Modern API Endpoints (`/api/...`):**
- `GET /api/products` - Get products with filtering and pagination
- `GET /api/products/:id` - Get product details by ID
- `POST /api/products` - Create new product with validation
- `PUT /api/products/:id` - Update product information
- `DELETE /api/products/:id` - Delete product (returns 204 status)
- `GET /api/categories` - Get product categories
- `GET /health` - Health check with service info
- `GET /ready` - Readiness check

**Legacy Endpoints:**
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

**Error Handling:**
- Proper 404 responses for not found
- 400 for validation errors
- 405 for unsupported HTTP methods

### 📦 Order Service (Port 3003)
Processes orders and maintains comprehensive order lifecycle management

**Modern API Endpoints (`/api/...`):**
- `GET /api/orders` - Get orders with status filtering
- `GET /api/orders/:id` - Get detailed order information
- `POST /api/orders` - Create new order with validation
- `PUT /api/orders/:id` - Update order status with workflow validation
- `DELETE /api/orders/:id` - Cancel order
- `GET /api/stats` - Get comprehensive order statistics
- `GET /health` - Service health status
- `GET /ready` - Service readiness check

**Legacy Endpoints:**
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create order
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Cancel order

**Advanced Features:**
- Order status validation (pending, processing, completed, cancelled, confirmed, shipped, delivered)
- Cross-service user validation
- Comprehensive error handling and input validation
- Order statistics and reporting

## 🔧 API Documentation

### Dashboard API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all registered services |
| POST | `/api/services` | Add new service |
| DELETE | `/api/services/:id` | Remove service |
| GET | `/api/services/:id/health` | Check specific service health |
| GET | `/api/health/all` | Check all services health |
| POST | `/api/services/:id/request` | Execute API request to service |

### Health Check Standards
All services implement standardized health check endpoints:

**Health Check Response Format:**
```javascript
// GET /health
{
    "status": "OK",                    // or "ERROR" 
    "service": "user-service",         // service identifier
    "timestamp": "2025-08-28T15:30:00.000Z"
}

// GET /ready  
{
    "status": "ready",                 // or "not-ready"
    "service": "user-service"
}
```

### Error Response Standards
All services return consistent error responses:

```javascript
// 400 Bad Request
{
    "error": "Validation failed: Name and email are required"
}

// 404 Not Found
{
    "error": "User not found"
}

// 405 Method Not Allowed
{
    "error": "Method not allowed"
}

// 500 Internal Server Error
{
    "error": "Internal server error",
    "message": "Detailed error description"
}
```

### API Testing Examples

**Create User:**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com", 
    "role": "user",
    "phone": "+1234567890"
  }'
```

**Get Products with Filtering:**
```bash
curl "http://localhost:3002/api/products?category=electronics&minPrice=100"
```

**Update Order Status:**
```bash
curl -X PUT http://localhost:3003/api/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'
```

### Health Check Implementation
For proper monitoring, implement standardized health endpoints in your microservices:

```javascript
// Express.js health check implementation
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'your-service-name',
        timestamp: new Date().toISOString()
    });
});

app.get('/ready', (req, res) => {
    res.json({ 
        status: 'ready', 
        service: 'your-service-name'
    });
});
```

### Modern API Design Standards
Follow these patterns for consistent API design:

```javascript
// RESTful endpoint structure
app.get('/api/resources', getAllHandler);           // GET collection
app.get('/api/resources/:id', getByIdHandler);      // GET single resource
app.post('/api/resources', createHandler);          // CREATE resource
app.put('/api/resources/:id', updateHandler);       // UPDATE resource  
app.delete('/api/resources/:id', deleteHandler);    // DELETE resource

// Error handling middleware
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// 405 Method Not Allowed handling
app.all('/api/resources/:id', (req, res) => {
    if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
        res.status(405).json({ error: 'Method not allowed' });
    }
});
```

## ⚙️ Configuration

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |

### Health Check Settings
```javascript
// Modify in src/index.js
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const REQUEST_TIMEOUT = 5000; // 5 seconds
```

## 🐳 Docker Support

### Using Docker
```bash
# Build image
docker build -t microservices-dashboard .

# Run container
docker run -p 3000:3000 microservices-dashboard
```

### Docker Compose
```yaml
version: '3.8'
services:
  dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

## 🧪 Testing

### Comprehensive Test Suite
The project includes 100% test coverage with 191 passing tests across multiple test categories:

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- tests/user-service.test.js
npm test -- tests/product-service.test.js  
npm test -- tests/order-service.test.js
npm test -- tests/e2e.test.js

# Run tests with coverage
npm run test:coverage
```

### Test Categories

**Unit Tests (179 tests):**
- Service Manager functionality
- API Client operations
- Health Check systems
- Security and validation
- Frontend components
- Utility functions

**Integration Tests (included in unit tests):**
- Full API endpoint testing
- Cross-service communication
- Error handling validation
- Authentication flows

**End-to-End Tests (12 tests):**
- Complete user journeys
- Cross-service data consistency
- Performance under load
- Error scenario handling

### Test Coverage Breakdown
```
Test Suites: 12 passed, 12 total
Tests:       191 passed, 191 total
Coverage:    100% statements, branches, functions, lines
```

### Running Tests in CI/CD
```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```
## 🚀 Development

### Project Structure
```
simple-dashboard-for-microservices/
├── src/
│   └── index.js              # Main server file with WebSocket support
├── public/
│   ├── index.html           # Modern responsive frontend
│   ├── styles.css           # Enhanced UI styles  
│   └── script.js            # Frontend JavaScript with real-time updates
├── examples/
│   ├── user-service.js      # Enhanced user service with /api endpoints
│   ├── product-service.js   # Product service with validation & error handling
│   └── order-service.js     # Order service with status workflow
├── tests/
│   ├── user-service.test.js # Comprehensive user service tests
│   ├── product-service.test.js # Product service test suite
│   ├── order-service.test.js # Order service test suite  
│   ├── e2e.test.js          # End-to-end integration tests
│   ├── frontend.test.js     # Frontend functionality tests
│   ├── security.test.js     # Security and validation tests
│   └── *.test.js            # Additional test suites
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
├── docker-compose.yml       # Multi-service Docker setup
├── Dockerfile              # Production container
├── start-services.sh       # Development service launcher
├── test-runner.sh          # Test execution script
├── package.json            # Enhanced with test scripts
├── QUICKSTART.md           # Quick setup guide
├── DEPLOYMENT.md           # Production deployment guide
└── README.md              # This comprehensive documentation
```

### Development Setup
```bash
# Install dependencies
npm install

# Start in development mode with auto-reload
npm run dev

# Start example services for testing
./start-services.sh

# Run comprehensive test suite
npm test

# Start individual services for debugging
node examples/user-service.js     # Port 3001
node examples/product-service.js  # Port 3002  
node examples/order-service.js    # Port 3003
```

### Available NPM Scripts
```bash
npm start              # Start production server
npm run dev           # Start development server with nodemon
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run lint          # Run ESLint code quality checks
npm run docs          # Generate API documentation
```

### Environment Configuration
```bash
# .env file example
PORT=3000
NODE_ENV=development
HEALTH_CHECK_INTERVAL=30000
REQUEST_TIMEOUT=5000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## 🔮 Roadmap

### ✅ Version 1.0 (Completed)
- [x] **Complete API modernization** - `/api` prefix with backward compatibility
- [x] **100% test coverage** - 191 tests across all components
- [x] **Enhanced error handling** - Proper HTTP status codes and validation
- [x] **Production-ready services** - Health checks, monitoring, documentation
- [x] **Security improvements** - Rate limiting, input validation, CORS
- [x] **Developer experience** - Comprehensive docs, examples, setup guides

### 🚧 Version 1.1 (Planned)
- [ ] **Authentication & Authorization** - JWT-based user authentication
- [ ] **Advanced Metrics** - Performance monitoring and analytics dashboard  
- [ ] **Custom Alerting** - Configurable alerts for service health
- [ ] **Service Discovery** - Automatic service registration and discovery
- [ ] **API Gateway** - Centralized routing and middleware
- [ ] **Configuration Management** - Environment-based service configuration

### 🔮 Version 1.2 (Future)  
- [ ] **Database Integration** - Persistent service and configuration storage
- [ ] **Advanced Filtering** - Complex search and filtering capabilities
- [ ] **Service Dependencies** - Dependency mapping and cascade monitoring
- [ ] **Load Balancing** - Built-in load balancer for service requests
- [ ] **Backup & Recovery** - Service state backup and restoration
- [ ] **Multi-Environment** - Development, staging, production environment support

### 🌟 Version 2.0 (Vision)
- [ ] **Plugin Architecture** - Extensible plugin system for custom integrations
- [ ] **Advanced Analytics** - AI-powered insights and predictive analytics
- [ ] **Multi-Tenant Support** - Enterprise multi-organization support
- [ ] **Kubernetes Integration** - Native Kubernetes service mesh integration
- [ ] **GraphQL Support** - GraphQL endpoint aggregation
- [ ] **Real-time Collaboration** - Team collaboration features

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Support & Resources

- 📖 **[Complete Documentation](README.md)** - Comprehensive project documentation
- 🚀 **[Quick Start Guide](QUICKSTART.md)** - Get started in 5 minutes
- 🏗️ **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- � **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- �🐛 **[Issue Tracker](https://github.com/Sarge1978/simple-dashboard-for-microservices/issues)** - Report bugs and request features
- 💬 **[Discussions](https://github.com/Sarge1978/simple-dashboard-for-microservices/discussions)** - Community discussions and Q&A

### Community & Support
- **GitHub Repository**: [simple-dashboard-for-microservices](https://github.com/Sarge1978/simple-dashboard-for-microservices)
- **Issue Templates**: Bug reports, feature requests, and documentation improvements
- **Pull Request Guidelines**: Comprehensive contribution workflow
- **Code of Conduct**: Inclusive and welcoming community standards

### Getting Help
1. **Check the documentation** - Most questions are answered in the docs
2. **Search existing issues** - Someone might have already asked your question
3. **Create a new issue** - Use the appropriate template for bug reports or feature requests
4. **Join discussions** - Participate in community discussions for general questions

## 🙏 Acknowledgments

- **[Express.js](https://expressjs.com/)** - Fast, unopinionated web framework for Node.js
- **[Socket.IO](https://socket.io/)** - Real-time bidirectional event-based communication
- **[Axios](https://axios-http.com/)** - Promise-based HTTP client for the browser and Node.js
- **[Jest](https://jestjs.io/)** - Comprehensive JavaScript testing framework
- **[Supertest](https://github.com/visionmedia/supertest)** - HTTP assertion library for testing
- **[Font Awesome](https://fontawesome.com/)** - Professional icon library
- **[Node.js Community](https://nodejs.org/)** - For the amazing runtime and ecosystem

### Contributors
Special thanks to all contributors who have helped make this project better:
- **Comprehensive testing framework** - Implementation of 100% test coverage
- **Modern API design** - RESTful endpoints with proper HTTP semantics
- **Production-ready features** - Health checks, monitoring, and error handling
- **Documentation improvements** - Clear, comprehensive, and up-to-date docs

---

<div align="center">
  
**⭐ Star this repo if you find it helpful! ⭐**

[🐛 Report Bug](https://github.com/Sarge1978/simple-dashboard-for-microservices/issues) • 
[✨ Request Feature](https://github.com/Sarge1978/simple-dashboard-for-microservices/issues) • 
[🤝 Contribute](CONTRIBUTING.md)

**Built with ❤️ for the microservices community**

</div>