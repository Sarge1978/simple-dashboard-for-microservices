// Jest setup file for polyfills and global configuration

// Polyfill for TextEncoder/TextDecoder for older Node.js versions
const { TextEncoder, TextDecoder } = require('util');

if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder;
}

// Set global timeout for all tests
jest.setTimeout(10000);
