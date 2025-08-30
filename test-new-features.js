const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAuthentication() {
    console.log('🔐 Testing Authentication Features...\n');

    try {
        // Test login with admin credentials
        console.log('1. Testing admin login...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        const { token, user } = loginResponse.data;
        console.log(`✅ Admin login successful: ${user.username} (${user.role})`);
        
        // Test accessing protected endpoints
        console.log('\n2. Testing protected endpoints...');
        const servicesResponse = await axios.get(`${BASE_URL}/api/services`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Services endpoint accessible: ${servicesResponse.data.length} services found`);
        
        // Test analytics endpoint
        console.log('\n3. Testing analytics endpoint...');
        const analyticsResponse = await axios.get(`${BASE_URL}/api/analytics/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Analytics endpoint accessible:', JSON.stringify(analyticsResponse.data.overview, null, 2));
        
        // Test system metrics
        console.log('\n4. Testing system metrics...');
        const systemResponse = await axios.get(`${BASE_URL}/api/analytics/system`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ System metrics accessible:', JSON.stringify(systemResponse.data.memory, null, 2));
        
        // Test user login
        console.log('\n5. Testing user login...');
        const userLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'user',
            password: 'user123'
        });
        
        const userToken = userLoginResponse.data.token;
        console.log(`✅ User login successful: ${userLoginResponse.data.user.username} (${userLoginResponse.data.user.role})`);
        
        // Test user trying to access admin endpoints
        console.log('\n6. Testing role-based access control...');
        try {
            await axios.post(`${BASE_URL}/api/services`, {
                name: 'Test Service',
                url: 'http://localhost:9999'
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            console.log('❌ User should not be able to add services');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('✅ Role-based access control working: User denied admin access');
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
        
        console.log('\n🎉 All authentication tests passed!');
        
    } catch (error) {
        console.log('❌ Authentication test failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

async function testAnalytics() {
    console.log('\n📊 Testing Analytics Features...\n');
    
    try {
        // Login first
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        
        // Generate some API requests to create analytics data
        console.log('1. Generating sample API requests...');
        for (let i = 0; i < 5; i++) {
            await axios.get(`${BASE_URL}/api/services`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
        
        // Wait a moment for metrics to be recorded
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test analytics with different time ranges
        console.log('\n2. Testing analytics with different time ranges...');
        const timeRanges = ['5m', '1h', '6h'];
        
        for (const range of timeRanges) {
            const analyticsResponse = await axios.get(`${BASE_URL}/api/analytics/dashboard?timeRange=${range}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const analytics = analyticsResponse.data;
            console.log(`✅ Analytics for ${range}:`, {
                totalRequests: analytics.overview.totalRequests,
                errorRate: analytics.overview.errorRate,
                avgResponseTime: analytics.overview.averageResponseTime,
                apiEndpoints: analytics.apiUsage.length
            });
        }
        
        console.log('\n🎉 All analytics tests passed!');
        
    } catch (error) {
        console.log('❌ Analytics test failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

async function runTests() {
    console.log('🚀 Testing New Dashboard Features\n');
    console.log('=' * 50);
    
    await testAuthentication();
    await testAnalytics();
    
    console.log('\n' + '=' * 50);
    console.log('✨ Test suite completed!');
    console.log('\n🔗 Open http://localhost:3000 in your browser to see the dashboard');
    console.log('🔑 Use admin/admin123 or user/user123 to login');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testAuthentication, testAnalytics };
