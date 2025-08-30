#!/usr/bin/env node

const http = require('http');

function checkService(url, name) {
    return new Promise((resolve) => {
        const request = http.get(url, (res) => {
            resolve({ name, status: 'Online', code: res.statusCode });
        });
        
        request.on('error', (err) => {
            resolve({ name, status: 'Offline', error: err.message });
        });
        
        request.setTimeout(3000, () => {
            request.destroy();
            resolve({ name, status: 'Timeout', error: 'Request timeout' });
        });
    });
}

async function checkAllServices() {
    console.log('Checking services status...\n');
    
    const services = [
        { url: 'http://localhost:3000/health', name: 'Dashboard (Main)' },
        { url: 'http://localhost:3001/users', name: 'User Service' },
        { url: 'http://localhost:3002/products', name: 'Product Service' },
        { url: 'http://localhost:3003/orders', name: 'Order Service' }
    ];
    
    const results = await Promise.all(
        services.map(service => checkService(service.url, service.name))
    );
    
    results.forEach(result => {
        const status = result.status === 'Online' ? '✅' : '❌';
        const info = result.code ? `(${result.code})` : result.error ? `(${result.error})` : '';
        console.log(`${status} ${result.name}: ${result.status} ${info}`);
    });
    
    const onlineCount = results.filter(r => r.status === 'Online').length;
    console.log(`\n${onlineCount}/${results.length} services are online`);
    
    if (onlineCount === results.length) {
        console.log('\n🎉 All services are running! Dashboard is ready for testing.');
        console.log('Open http://localhost:3000 in your browser to test the dashboard.');
    } else {
        console.log('\n⚠️  Some services are not running. Please start missing services.');
    }
}

checkAllServices().catch(console.error);
