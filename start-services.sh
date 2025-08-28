#!/bin/bash

# Script to start example microservices for testing

echo "🚀 Starting example microservices..."

# Start User Service
echo "📱 Starting User Service on port 3001..."
node examples/user-service.js &
USER_PID=$!

# Start Product Service  
echo "🛍️ Starting Product Service on port 3002..."
node examples/product-service.js &
PRODUCT_PID=$!

# Start Order Service
echo "📦 Starting Order Service on port 3003..."
node examples/order-service.js &
ORDER_PID=$!

echo ""
echo "✅ All services started!"
echo "📱 User Service: http://localhost:3001"
echo "🛍️ Product Service: http://localhost:3002" 
echo "📦 Order Service: http://localhost:3003"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt signal
trap 'echo "🛑 Stopping all services..."; kill $USER_PID $PRODUCT_PID $ORDER_PID; exit' INT

# Keep script running
wait
