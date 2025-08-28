# 🚀 Deployment Guide

This guide covers different deployment options for the Microservices Web Interface.

## 📋 Prerequisites

- Node.js 10.0.0 or higher
- npm 6.0.0 or higher
- Docker (optional, for containerized deployment)

## 🖥️ Local Development

### Quick Start
```bash
git clone https://github.com/your-username/microservices-web-interface.git
cd microservices-web-interface
npm install
npm start
```

### With Example Services
```bash
# Terminal 1: Start the dashboard
npm start

# Terminal 2: Start example microservices
npm run examples
```

## 🐳 Docker Deployment

### Single Container
```bash
# Build the image
docker build -t microservices-dashboard .

# Run the container
docker run -p 3000:3000 microservices-dashboard
```

### Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## ☁️ Cloud Deployment

### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-microservices-dashboard

# Deploy
git push heroku main

# Open the app
heroku open
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts
```

### AWS EC2
```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/your-username/microservices-web-interface.git
cd microservices-web-interface
npm install

# Install PM2 for process management
sudo npm install -g pm2

# Start with PM2
pm2 start src/index.js --name "microservices-dashboard"
pm2 save
pm2 startup
```

### Digital Ocean Droplet
```bash
# Create a new droplet with Node.js
# SSH into your droplet
ssh root@your-droplet-ip

# Clone repository
git clone https://github.com/your-username/microservices-web-interface.git
cd microservices-web-interface

# Install dependencies
npm install

# Setup PM2
npm install -g pm2
pm2 start src/index.js --name dashboard
pm2 startup
pm2 save

# Setup Nginx (optional)
sudo apt update
sudo apt install nginx
# Configure nginx reverse proxy
```

## 🔧 Production Configuration

### Environment Variables
```bash
# .env file
NODE_ENV=production
PORT=3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
HEALTH_CHECK_INTERVAL=30000
LOG_LEVEL=info
```

### PM2 Ecosystem File
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'microservices-dashboard',
    script: 'src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/microservices-dashboard
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Considerations

### Production Checklist
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up authentication (if needed)
- [ ] Configure rate limiting
- [ ] Enable logging
- [ ] Set up monitoring
- [ ] Configure firewall rules
- [ ] Use environment variables for sensitive data

### SSL/HTTPS Setup
```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📊 Monitoring & Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart app
pm2 restart microservices-dashboard
```

### Docker Monitoring
```bash
# View container logs
docker logs -f container-name

# Monitor resources
docker stats

# Health check
docker inspect --format='{{.State.Health.Status}}' container-name
```

## 🔄 Updates & Maintenance

### Manual Updates
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart the application
pm2 restart microservices-dashboard
```

### Automated Updates (GitHub Actions)
The project includes a CI/CD pipeline that automatically:
- Tests the code
- Builds Docker images
- Deploys to staging/production

## 🆘 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 PID
```

#### Permission Denied
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

#### Docker Issues
```bash
# Clean up Docker
docker system prune -a

# Rebuild without cache
docker build --no-cache -t microservices-dashboard .
```

### Health Check Endpoints
- Dashboard: `GET http://localhost:3000/api/services`
- Docker: `docker inspect --format='{{.State.Health.Status}}' container-name`

## 📞 Support

If you encounter issues during deployment:
1. Check the [troubleshooting guide](README.md#troubleshooting)
2. Search [existing issues](https://github.com/your-username/microservices-web-interface/issues)
3. Create a new issue with deployment details
