// Global variables
let services = [];
let socket;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSocket();
    loadServices();
    initializeEventListeners();
    addLog('info', 'Dashboard initialized');
});

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
        const response = await fetch('/api/services');
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
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">
                <i class="fas fa-server" style="font-size: 3rem; margin-bottom: 20px;"></i>
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
                ${getStatusText(service.status)}
            </div>
        </div>
        
        <div class="service-description">
            ${service.description || 'No description provided'}
        </div>
        
        <div class="service-actions">
            <button class="btn btn-success" onclick="checkServiceHealth(${service.id})">
                <i class="fas fa-heartbeat"></i> Check
            </button>
            <button class="btn btn-primary" onclick="selectServiceForTesting(${service.id})">
                <i class="fas fa-vial"></i> Test
            </button>
            <button class="btn btn-danger" onclick="removeService(${service.id})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
        
        ${service.endpoints && service.endpoints.length > 0 ? `
            <div style="margin-top: 15px;">
                <small style="color: #6c757d; font-weight: 500;">Endpoints:</small>
                <div style="margin-top: 5px;">
                    ${service.endpoints.map(endpoint => `
                        <div style="font-size: 0.8rem; color: #495057; margin: 2px 0;">
                            <span style="background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-weight: 500;">${endpoint.method}</span>
                            <span style="font-family: monospace;">${endpoint.path}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
    
    return card;
}

// Get status text with icon
function getStatusText(status) {
    switch (status) {
        case 'online':
            return '<i class="fas fa-check-circle"></i> Online';
        case 'offline':
            return '<i class="fas fa-times-circle"></i> Offline';
        default:
            return '<i class="fas fa-question-circle"></i> Unknown';
    }
}

// Update service statuses from WebSocket data
function updateServiceStatuses(healthData) {
    healthData.forEach(health => {
        const service = services.find(s => s.id === health.id);
        if (service) {
            service.status = health.status;
            service.lastCheck = health.lastCheck;
            
            const statusElement = document.getElementById(`status-${health.id}`);
            if (statusElement) {
                statusElement.className = `service-status status-${health.status}`;
                statusElement.innerHTML = getStatusText(health.status);
            }
        }
    });
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

// Update endpoints dropdown when service is selected
function updateEndpoints() {
    const serviceId = document.getElementById('serviceSelect').value;
    const pathInput = document.getElementById('pathInput');
    
    if (!serviceId) {
        pathInput.value = '';
        return;
    }
    
    const service = services.find(s => s.id == serviceId);
    if (service && service.endpoints && service.endpoints.length > 0) {
        // Show first endpoint as example
        pathInput.value = service.endpoints[0].path;
    }
}

// Select service for testing
function selectServiceForTesting(serviceId) {
    document.getElementById('serviceSelect').value = serviceId;
    updateEndpoints();
    
    // Scroll to API tester
    document.querySelector('.api-tester-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
    
    addLog('info', `Selected service for testing: ${services.find(s => s.id === serviceId)?.name}`);
}

// Check health of specific service
async function checkServiceHealth(serviceId) {
    try {
        showLoading(true);
        const response = await fetch(`/api/services/${serviceId}/health`);
        const health = await response.json();
        
        const service = services.find(s => s.id === serviceId);
        if (service) {
            service.status = health.status;
            service.lastCheck = new Date().toISOString();
            
            const statusElement = document.getElementById(`status-${serviceId}`);
            if (statusElement) {
                statusElement.className = `service-status status-${health.status}`;
                statusElement.innerHTML = getStatusText(health.status);
            }
            
            addLog(health.status === 'online' ? 'success' : 'error', 
                   `${service.name}: ${health.status} (${health.responseTime})`);
        }
    } catch (error) {
        addLog('error', `Service check error: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Check all services health
async function checkAllServices() {
    try {
        showLoading(true);
        const response = await fetch('/api/health/all');
        const healthData = await response.json();
        
        updateServiceStatuses(healthData);
        addLog('success', 'All services checked');
    } catch (error) {
        addLog('error', `Error checking services: ${error.message}`);
    } finally {
        showLoading(false);
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
        addLog('warning', 'Select service and specify API path');
        return;
    }
    
    try {
        showLoading(true);
        
        let headers = {};
        if (headersText.trim()) {
            headers = JSON.parse(headersText);
        }
        
        let data = null;
        if (bodyText.trim() && ['POST', 'PUT', 'PATCH'].includes(method)) {
            data = JSON.parse(bodyText);
        }
        
        const response = await fetch(`/api/services/${serviceId}/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                method,
                path,
                headers,
                data
            })
        });
        
        const result = await response.json();
        displayApiResponse(result);
        
        const service = services.find(s => s.id == serviceId);
        addLog('info', `API request: ${method} ${service?.name}${path} - ${result.status || 'Error'}`);
        
    } catch (error) {
        displayApiResponse({
            error: error.message,
            status: 'Error'
        });
        addLog('error', `API request error: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Display API response
function displayApiResponse(result) {
    const statusElement = document.getElementById('responseStatus');
    const bodyElement = document.getElementById('responseBody');
    
    if (result.error) {
        statusElement.textContent = `Error: ${result.status || 'Unknown'}`;
        statusElement.className = 'response-status btn-danger';
        bodyElement.textContent = JSON.stringify(result, null, 2);
    } else {
        statusElement.textContent = `${result.status} ${result.statusText}`;
        statusElement.className = `response-status ${result.status < 400 ? 'btn-success' : 'btn-danger'}`;
        bodyElement.textContent = JSON.stringify(result.data, null, 2);
    }
}

// Clear API results
function clearApiResults() {
    document.getElementById('responseStatus').textContent = '';
    document.getElementById('responseBody').textContent = 'Select service and execute request';
    document.getElementById('pathInput').value = '';
    document.getElementById('headersInput').value = '';
    document.getElementById('bodyInput').value = '';
    addLog('info', 'API results cleared');
}

// Show/hide add service modal
function showAddServiceModal() {
    document.getElementById('addServiceModal').style.display = 'block';
}

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
        showLoading(true);
        const response = await fetch('/api/services', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                url,
                description
            })
        });
        
        if (response.ok) {
            const newService = await response.json();
            services.push(newService);
            renderServices();
            populateServiceSelect();
            hideAddServiceModal();
            addLog('success', `Added new service: ${name}`);
        } else {
            throw new Error('Failed to add service');
        }
    } catch (error) {
        addLog('error', `Error adding service: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Remove service
async function removeService(serviceId) {
    if (!confirm('Are you sure you want to remove this service?')) {
        return;
    }
    
    try {
        showLoading(true);
        const response = await fetch(`/api/services/${serviceId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            services = services.filter(s => s.id !== serviceId);
            renderServices();
            populateServiceSelect();
            
            const serviceName = services.find(s => s.id === serviceId)?.name || 'Unknown';
            addLog('warning', `Removed service: ${serviceName}`);
        } else {
            throw new Error('Failed to remove service');
        }
    } catch (error) {
        addLog('error', `Error removing service: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Add log entry
function addLog(level, message) {
    const logsContainer = document.getElementById('logsContainer');
    const timestamp = new Date().toLocaleTimeString();
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
        <span class="log-timestamp">[${timestamp}]</span>
        <span class="log-level-${level}">[${level.toUpperCase()}]</span>
        ${message}
    `;
    
    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
    
    // Keep only last 100 log entries
    const entries = logsContainer.children;
    if (entries.length > 100) {
        logsContainer.removeChild(entries[0]);
    }
}

// Show/hide loading overlay
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
