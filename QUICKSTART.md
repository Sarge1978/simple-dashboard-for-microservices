# 🚀 Quick Start - Simple Dashboard for Microservices

## What's already created:

### 1. 📊 Web Interface (Dashboard)
- **URL**: http://localhost:3000
- **Features**:
  - Real-time microservices status monitoring
  - API tester for service requests
  - Add/remove services
  - Activity logs
  - Automatic health checks every 30 seconds

### 2. 🔧 Example Microservices
Created 3 example services for demonstration:

#### User Service (port 3001)
- `GET /users` - get all users
- `GET /users/:id` - get user by ID
- `POST /users` - create user
- `PUT /users/:id` - update user
- `DELETE /users/:id` - delete user

#### Product Service (port 3002)
- `GET /products` - get products (with filters)
- `GET /products/:id` - get product by ID
- `POST /products` - create product
- `PUT /products/:id` - update product
- `DELETE /products/:id` - delete product
- `GET /categories` - get categories

#### Order Service (port 3003)
- `GET /orders` - get orders (with filters)
- `GET /orders/:id` - get order by ID
- `POST /orders` - create order
- `PUT /orders/:id/status` - update order status
- `DELETE /orders/:id` - cancel order
- `GET /stats` - order statistics

## 🏃 Running MVP

### Option 1: All in one terminal
```bash
# 1. Start web interface (already running)
npm start

# 2. In new terminal, start example services
./start-services.sh
```

### Option 2: Separate launch
```bash
# Terminal 1: Web interface
npm start

# Terminal 2: User Service
node examples/user-service.js

# Terminal 3: Product Service  
node examples/product-service.js

# Terminal 4: Order Service
node examples/order-service.js
```

## 🎯 MVP Testing

1. **Open dashboard**: http://localhost:3000
2. **Check service status**: click "Check All"
3. **Test API**:
   - Select service (e.g., User Service)
   - Select GET method
   - Enter path `/users`
   - Click "Execute"

## 📋 Example Requests

### Get all users
- Service: User Service
- Method: GET  
- Path: `/users`

### Create user
- Service: User Service
- Method: POST
- Path: `/users`
- Request body:
```json
{
  "name": "New User",
  "email": "new@example.com",
  "role": "user"
}
```

### Get products by category
- Service: Product Service
- Method: GET
- Path: `/products?category=electronics`

### Create order
- Service: Order Service
- Method: POST
- Path: `/orders`
- Request body:
```json
{
  "userId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 50000
    }
  ]
}
```

## 🔧 Extension capabilities

### Adding your own microservice
1. Create service with `/health` endpoint
2. In dashboard click "Add Service"
3. Specify name, URL and description
4. Service will automatically appear in the list

### Example health endpoint
```javascript
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'My Service',
        timestamp: new Date().toISOString()
    });
});
```

## 🎨 Interface features

- **Responsive design** - works on all devices
- **Real-time updates** - statuses update automatically
- **Beautiful animations** - modern Material Design
- **Dark theme** in logs and API response panels
- **JSON syntax highlighting**
- **Auto-save** settings

## 🚀 Next steps

1. **Add authentication** for security
2. **Integrate with database** instead of in-memory storage
3. **Add metrics monitoring** (CPU, memory, response time)
4. **Set up notifications** when services go down
5. **Add Docker support** for containerization
6. **Create CI/CD pipeline** for automatic deployment

Your MVP is ready to use! 🎉
