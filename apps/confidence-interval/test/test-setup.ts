import 'jsdom-global/register';

// Mocha globals setup
declare const global: any;

// Set up any global test utilities
global.expect = require('chai').expect;