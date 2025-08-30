// Global variables
let services = [];
let socket;
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    if (authToken) {
        verifyAuth();
    } else {
        showLogin();
    }
});

// Authentication Functions
async function verifyAuth() {
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showMainApp();
            initializeApp();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Auth verification failed:', error);
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    
    // Add login form event listener
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

function showMainApp() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Update user info
    document.getElementById('userWelcome').textContent = `Welcome, ${currentUser.username} (${currentUser.role})`;
    
    // Show/hide admin controls
    const addServiceBtn = document.getElementById('addServiceBtn');
    if (currentUser.role !== 'admin') {
        addServiceBtn.style.display = 'none';
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            showMainApp();
            initializeApp();
        } else {
            console.error('Login failed:', data);
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: Network error or server unavailable');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    if (socket) {
        socket.disconnect();
    }
    showLogin();
}

// Initialize the main application
function initializeApp() {
    initializeSocket();
    loadServices();
    loadAnalytics();
    initializeEventListeners();
    initializeCollapsibleSections();
    addLog('info', 'Dashboard initialized');
    
    // Start periodic updates
    setInterval(loadAnalytics, 30000); // Update analytics every 30 seconds
}

// API Request Helper
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    const response = await fetch(url, mergedOptions);
    
    if (response.status === 401) {
        // Token expired, redirect to login
        logout();
        throw new Error('Authentication failed');
    }
    
    return response;
}

// Initialize Socket.IO connection
function initializeSocket() {
    socket = io();
    
    socket.on('connect', () => {
        addLog('success', 'Connection to server established');
    });
    
    socket.on('disconnect', () => {
        addLog('warning', 'Connection to server lost');
    });
    
    socket.on('health-update', (healthData) => {
        updateServiceStatuses(healthData);
        addLog('info', 'Service statuses updated');
    });
}

// Collapsible Sections
function initializeCollapsibleSections() {
    // Set initial state (analytics expanded by default)
    const sections = ['analytics', 'services', 'api-tester', 'logs'];
    sections.forEach((section, index) => {
        if (section === 'analytics') {
            expandSection(section);
        } else {
            collapseSection(section);
        }
    });
}

function toggleSection(sectionName) {
    const content = document.getElementById(`${sectionName}-content`);
    const collapseBtn = content.parentElement.querySelector('.collapse-btn');
    
    if (content.classList.contains('collapsed')) {
        expandSection(sectionName);
    } else {
        collapseSection(sectionName);
    }
}

function expandSection(sectionName) {
    const content = document.getElementById(`${sectionName}-content`);
    const collapseBtn = content.parentElement.querySelector('.collapse-btn');
    
    content.classList.remove('collapsed');
    collapseBtn.classList.remove('collapsed');
    collapseBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
}

function collapseSection(sectionName) {
    const content = document.getElementById(`${sectionName}-content`);
    const collapseBtn = content.parentElement.querySelector('.collapse-btn');
    
    content.classList.add('collapsed');
    collapseBtn.classList.add('collapsed');
    collapseBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
}

// Analytics Functions
async function loadAnalytics() {
    try {
        const timeRange = document.getElementById('timeRangeSelect')?.value || '1h';
        const [analyticsResponse, systemResponse] = await Promise.all([
            apiRequest(`/api/analytics/dashboard?timeRange=${timeRange}`),
            apiRequest('/api/analytics/system')
        ]);
        
        const analyticsData = await analyticsResponse.json();
        const systemData = await systemResponse.json();
        
        updateAnalyticsDisplay(analyticsData);
        updateSystemMetrics(systemData);
    } catch (error) {
        console.error('Error loading analytics:', error);
        addLog('error', `Error loading analytics: ${error.message}`);
    }
}

function updateAnalyticsDisplay(data) {
    // Update overview metrics
    const overview = data.overview;
    document.getElementById('totalRequests').textContent = overview.totalRequests || 0;
    document.getElementById('errorRate').textContent = `${overview.errorRate || 0}%`;
    document.getElementById('avgResponseTime').textContent = `${overview.averageResponseTime || 0}ms`;
    document.getElementById('uptime').textContent = formatUptime(overview.uptime || 0);
    
    // Update top endpoints
    updateTopEndpoints(data.apiUsage || []);
}

function updateSystemMetrics(data) {
    document.getElementById('memoryUsage').textContent = `${data.memory?.rss || 0} MB`;
    document.getElementById('heapUsed').textContent = `${data.memory?.heapUsed || 0} MB`;
    document.getElementById('processId').textContent = data.pid || '-';
    document.getElementById('nodeVersion').textContent = data.version || '-';
}

function updateTopEndpoints(endpoints) {
    const container = document.getElementById('topEndpoints');
    container.innerHTML = '';
    
    if (endpoints.length === 0) {
        container.innerHTML = '<div class="no-data">No API usage data available</div>';
        return;
    }
    
    endpoints.slice(0, 10).forEach(endpoint => {
        const item = document.createElement('div');
        item.className = 'endpoint-item';
        item.innerHTML = `
            <span class="endpoint-name">${endpoint.method} ${endpoint.url}</span>
            <span class="endpoint-count">${endpoint.count}</span>
        `;
        container.appendChild(item);
    });
}

function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

function updateAnalytics() {
    loadAnalytics();
}

// Initialize event listeners
function initializeEventListeners() {
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('addServiceModal');
        if (event.target == modal) {
            hideAddServiceModal();
        }
    };

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideAddServiceModal();
        }
        if (e.ctrlKey && e.key === 'Enter') {
            executeRequest();
        }
    });
}

// Load services from API
async function loadServices() {
    try {
        showLoading(true);
        const response = await apiRequest('/api/services');
        services = await response.json();
        renderServices();
        populateServiceSelect();
        addLog('success', `Loaded ${services.length} services`);
    } catch (error) {
        addLog('error', `Error loading services: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Render services grid
function renderServices() {
    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = '';
    
    if (services.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6c757d;">
                <i class="fas fa-server" style="font-size: 3rem; margin-bottom: 20px; color: #dee2e6;"></i>
                <h3>No services added</h3>
                <p>Click "Add Service" to get started</p>
            </div>
        `;
        return;
    }
    
    services.forEach(service => {
        const card = createServiceCard(service);
        grid.appendChild(card);
    });
}

// Create service card element
function createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
        <div class="service-header">
            <div class="service-info">
                <h3>${service.name}</h3>
                <div class="service-url">${service.url}</div>
            </div>
            <div class="service-status status-${service.status}" id="status-${service.id}">
                ${getStatusIcon(service.status)} ${service.status}
            </div>
        </div>
        
        <div class="service-description">
            ${service.description || 'No description available'}
        </div>
        
        <div class="service-actions">
            <button class="btn btn-outline" onclick="checkServiceHealth(${service.id})">
                <i class="fas fa-heartbeat"></i> Check Health
            </button>
            ${currentUser && currentUser.role === 'admin' ? `
                <button class="btn btn-danger" onclick="removeService(${service.id})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            ` : ''}
        </div>
        
        ${service.lastCheck ? `
            <div class="service-meta">
                Last checked: ${new Date(service.lastCheck).toLocaleString()}
            </div>
        ` : ''}
    `;
    return card;
}

// Get status icon
function getStatusIcon(status) {
    switch (status) {
        case 'online': return '<i class="fas fa-check-circle"></i>';
        case 'offline': return '<i class="fas fa-times-circle"></i>';
        default: return '<i class="fas fa-question-circle"></i>';
    }
}

// Check service health
async function checkServiceHealth(serviceId) {
    try {
        const response = await apiRequest(`/api/services/${serviceId}/health`);
        const health = await response.json();
        
        // Update the service status in the UI
        const statusElement = document.getElementById(`status-${serviceId}`);
        if (statusElement) {
            statusElement.className = `service-status status-${health.status}`;
            statusElement.innerHTML = `${getStatusIcon(health.status)} ${health.status}`;
        }
        
        // Update the service object
        const service = services.find(s => s.id === serviceId);
        if (service) {
            service.status = health.status;
            service.lastCheck = new Date().toISOString();
        }
        
        addLog('info', `Health check completed for service ${serviceId}: ${health.status}`);
    } catch (error) {
        addLog('error', `Health check failed for service ${serviceId}: ${error.message}`);
    }
}

// Check all services health
async function checkAllServices() {
    try {
        const response = await apiRequest('/api/health/all');
        const healthData = await response.json();
        updateServiceStatuses(healthData);
        addLog('success', 'All services health checked');
    } catch (error) {
        addLog('error', `Error checking all services: ${error.message}`);
    }
}

// Update service statuses
function updateServiceStatuses(healthData) {
    healthData.forEach(health => {
        const statusElement = document.getElementById(`status-${health.id}`);
        if (statusElement) {
            statusElement.className = `service-status status-${health.status}`;
            statusElement.innerHTML = `${getStatusIcon(health.status)} ${health.status}`;
        }
        
        // Update the service object
        const service = services.find(s => s.id === health.id);
        if (service) {
            service.status = health.status;
            service.lastCheck = health.lastCheck;
        }
    });
}

// Show add service modal
function showAddServiceModal() {
    if (currentUser && currentUser.role === 'admin') {
        document.getElementById('addServiceModal').style.display = 'block';
    } else {
        alert('You need admin privileges to add services');
    }
}

// Hide add service modal
function hideAddServiceModal() {
    document.getElementById('addServiceModal').style.display = 'none';
    document.getElementById('addServiceForm').reset();
}

// Add new service
async function addService(event) {
    event.preventDefault();
    
    const name = document.getElementById('serviceName').value;
    const url = document.getElementById('serviceUrl').value;
    const description = document.getElementById('serviceDescription').value;
    
    try {
        const response = await apiRequest('/api/services', {
            method: 'POST',
            body: JSON.stringify({ name, url, description })
        });
        
        if (response.ok) {
            const newService = await response.json();
            services.push(newService);
            renderServices();
            populateServiceSelect();
            hideAddServiceModal();
            addLog('success', `Service "${name}" added successfully`);
        } else {
            const error = await response.json();
            addLog('error', `Error adding service: ${error.error}`);
        }
    } catch (error) {
        addLog('error', `Error adding service: ${error.message}`);
    }
}

// Remove service
async function removeService(serviceId) {
    if (!confirm('Are you sure you want to remove this service?')) {
        return;
    }
    
    try {
        const response = await apiRequest(`/api/services/${serviceId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            services = services.filter(s => s.id !== serviceId);
            renderServices();
            populateServiceSelect();
            addLog('success', 'Service removed successfully');
        } else {
            const error = await response.json();
            addLog('error', `Error removing service: ${error.error}`);
        }
    } catch (error) {
        addLog('error', `Error removing service: ${error.message}`);
    }
}

// Populate service select dropdown
function populateServiceSelect() {
    const select = document.getElementById('serviceSelect');
    select.innerHTML = '<option value="">Select Service</option>';
    
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = service.name;
        select.appendChild(option);
    });
}

// Update endpoints based on selected service
function updateEndpoints() {
    const serviceId = document.getElementById('serviceSelect').value;
    const service = services.find(s => s.id == serviceId);
    
    if (service && service.endpoints && service.endpoints.length > 0) {
        // Could populate endpoint suggestions here
    }
}

// Execute API request
async function executeRequest() {
    const serviceId = document.getElementById('serviceSelect').value;
    const method = document.getElementById('methodSelect').value;
    const path = document.getElementById('pathInput').value;
    const headersText = document.getElementById('headersInput').value;
    const bodyText = document.getElementById('bodyInput').value;
    
    if (!serviceId || !path) {
        alert('Please select a service and enter a path');
        return;
    }
    
    try {
        let headers = {};
        if (headersText.trim()) {
            headers = JSON.parse(headersText);
        }
        
        let data = null;
        if (bodyText.trim() && ['POST', 'PUT', 'PATCH'].includes(method)) {
            data = JSON.parse(bodyText);
        }
        
        const requestBody = {
            method,
            path,
            headers,
            data
        };
        
        const response = await apiRequest(`/api/services/${serviceId}/request`, {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });
        
        const result = await response.json();
        
        // Display response
        document.getElementById('responseStatus').textContent = `${result.status || response.status} ${result.statusText || response.statusText}`;
        document.getElementById('responseStatus').className = `response-status ${response.ok ? 'success' : 'error'}`;
        document.getElementById('responseBody').textContent = JSON.stringify(result.data || result, null, 2);
        
        addLog('info', `API request executed: ${method} ${path} - Status: ${result.status || response.status}`);
        
    } catch (error) {
        document.getElementById('responseStatus').textContent = 'Error';
        document.getElementById('responseStatus').className = 'response-status error';
        document.getElementById('responseBody').textContent = error.message;
        addLog('error', `API request failed: ${error.message}`);
    }
}

// Clear API results
function clearApiResults() {
    document.getElementById('responseStatus').textContent = '';
    document.getElementById('responseBody').textContent = 'Select service and execute request';
    document.getElementById('pathInput').value = '';
    document.getElementById('headersInput').value = '';
    document.getElementById('bodyInput').value = '';
}

// Logging functions
function addLog(level, message) {
    const container = document.getElementById('logsContainer');
    const log = document.createElement('div');
    log.className = `log-entry log-${level}`;
    
    const timestamp = new Date().toLocaleTimeString();
    const icon = getLogIcon(level);
    
    log.innerHTML = `
        <span class="log-time">${timestamp}</span>
        <span class="log-icon">${icon}</span>
        <span class="log-message">${message}</span>
    `;
    
    container.insertBefore(log, container.firstChild);
    
    // Keep only last 100 logs
    while (container.children.length > 100) {
        container.removeChild(container.lastChild);
    }
}

function getLogIcon(level) {
    switch (level) {
        case 'success': return '<i class="fas fa-check-circle"></i>';
        case 'error': return '<i class="fas fa-exclamation-circle"></i>';
        case 'warning': return '<i class="fas fa-exclamation-triangle"></i>';
        default: return '<i class="fas fa-info-circle"></i>';
    }
}

// Loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// Utility functions
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
