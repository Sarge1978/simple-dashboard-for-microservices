# 🚀 Simple Dashboard for Microservices

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2010.0.0-brightgreen.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> A modern, real-time web dashboard for monitoring and managing REST microservices

![Dashboard Screenshot](https://via.placeholder.com/800x400/667eea/white?text=Microservices+Dashboard)

## ✨ Features

### 🎯 Core Functionality
- **📊 Real-time Dashboard** - Visual monitoring of all microservices with live status updates
- **🔍 API Testing Tool** - Built-in interface for testing service endpoints with full HTTP method support
- **⚡ Live Health Checks** - Automatic service monitoring every 30 seconds with WebSocket updates
- **🛠️ Service Management** - Easy addition, removal, and configuration of microservices
- **📝 Activity Logging** - Comprehensive tracking of all actions and events with color-coded levels
- **📱 Responsive Design** - Modern UI that works seamlessly on desktop, tablet, and mobile

### 🔧 Technical Features
- **WebSocket Integration** - Real-time updates without page refresh
- **Rate Limiting** - Built-in API protection against abuse
- **CORS Support** - Cross-origin request handling for distributed architectures
- **JSON Highlighting** - Syntax highlighting for API responses
- **Auto-discovery** - Automatic detection of service endpoints
- **Batch Operations** - Manage multiple services simultaneously

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 10.0.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/microservices-web-interface.git
   cd microservices-web-interface
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

The project includes three example microservices to demonstrate functionality:

### 👤 User Service (Port 3001)
Manages user accounts and profiles
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID  
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### 🛍️ Product Service (Port 3002)  
Handles product catalog and inventory
- `GET /products` - Get products (with filtering)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /categories` - Get product categories

### 📦 Order Service (Port 3003)
Processes orders and maintains order history
- `GET /orders` - Get orders (with filtering)
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create new order
- `PUT /orders/:id/status` - Update order status
- `DELETE /orders/:id` - Cancel order
- `GET /stats` - Get order statistics

## 🔧 API Documentation

### Service Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all registered services |
| POST | `/api/services` | Add new service |
| DELETE | `/api/services/:id` | Remove service |

### Health Monitoring  
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services/:id/health` | Check specific service health |
| GET | `/api/health/all` | Check all services health |

### API Testing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/services/:id/request` | Execute API request to service |

### Health Check Implementation
For proper monitoring, implement a `/health` endpoint in your microservices:

```javascript
// Express.js example
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        service: 'Your Service Name',
        timestamp: new Date().toISOString(),
        version: '1.0.0' // optional
    });
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

## 🚀 Development

### Project Structure
```
microservices-web-interface/
├── src/
│   └── index.js              # Main server file
├── public/
│   ├── index.html           # Frontend HTML
│   ├── styles.css           # UI styles  
│   └── script.js            # Frontend JavaScript
├── examples/
│   ├── user-service.js      # Example user service
│   ├── product-service.js   # Example product service
│   └── order-service.js     # Example order service
├── start-services.sh        # Script to start example services
├── package.json             # Project configuration
└── README.md               # Documentation
```

### Development Setup
```bash
# Install dependencies
npm install

# Start in development mode with auto-reload
npm run dev

# Start example services
./start-services.sh
```

## 🔮 Roadmap

### Version 1.1
- [ ] Authentication and authorization
- [ ] Service metrics and performance monitoring
- [ ] Custom alert configurations
- [ ] Export/import service configurations

### Version 1.2  
- [ ] Database integration for service persistence
- [ ] Advanced filtering and search
- [ ] Service dependency mapping
- [ ] Bulk operations for service management

### Version 2.0
- [ ] Plugin system for custom integrations
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant support
- [ ] Kubernetes integration

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

## 💡 Support

- 📖 [Documentation](README.md)
- 🚀 [Quick Start Guide](QUICKSTART.md)
- 🐛 [Issue Tracker](https://github.com/your-username/microservices-web-interface/issues)
- 💬 [Discussions](https://github.com/your-username/microservices-web-interface/discussions)

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [Socket.IO](https://socket.io/) - Real-time communication
- [Axios](https://axios-http.com/) - HTTP client
- [Font Awesome](https://fontawesome.com/) - Icons

---

<div align="center">
  <strong>⭐ Star this repo if you find it helpful!</strong>
</div>

### Database Integration
Replace in-memory storage with database:
```javascript
// For example, with MongoDB
import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
    name: String,
    url: String,
    description: String,
    status: String,
    lastCheck: Date
});
```

## Deployment

### Docker
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Production Settings
- Use process manager (PM2)
- Configure reverse proxy (nginx)
- Add SSL certificates
- Set up logging

## License
ISC

## Support
If you have questions or suggestions, create an issue in the project repository.

## Project Structure
```
my-project
├── src
│   └── index.js      # Entry point of the application
├── package.json      # Configuration file for npm
└── README.md         # Documentation for the project
```

## Contributing
If you would like to contribute to this project, please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License.