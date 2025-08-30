#!/usr/bin/env node

console.log('Testing setup...');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

// Test if main dependencies exist
try {
    const express = require('express');
    console.log('✓ Express is available');
} catch (e) {
    console.log('✗ Express not found:', e.message);
}

try {
    const cors = require('cors');
    console.log('✓ CORS is available');
} catch (e) {
    console.log('✗ CORS not found:', e.message);
}

try {
    const jwt = require('jsonwebtoken');
    console.log('✓ JWT is available');
} catch (e) {
    console.log('✗ JWT not found:', e.message);
}

try {
    const bcrypt = require('bcryptjs');
    console.log('✓ Bcrypt is available');
} catch (e) {
    console.log('✗ Bcrypt not found:', e.message);
}

// Test if our services exist
const fs = require('fs');
const path = require('path');

const authServicePath = path.join(__dirname, 'src/services/AuthService.js');
const perfMonitorPath = path.join(__dirname, 'src/services/PerformanceMonitor.js');

if (fs.existsSync(authServicePath)) {
    console.log('✓ AuthService file exists');
} else {
    console.log('✗ AuthService file not found');
}

if (fs.existsSync(perfMonitorPath)) {
    console.log('✓ PerformanceMonitor file exists');
} else {
    console.log('✗ PerformanceMonitor file not found');
}

console.log('Setup test complete!');
