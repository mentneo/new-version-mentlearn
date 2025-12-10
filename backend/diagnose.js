#!/usr/bin/env node

/**
 * Diagnostic script to test backend startup
 * Run this locally to check for errors before deploying
 */

console.log('🔍 Starting backend diagnostic...\n');

// Check Node version
console.log('Node version:', process.version);
console.log('Expected: v20.x or higher\n');

// Check for required files
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'server.js',
  'package.json',
  '.env',
  'routes/razorpayRoutes.js'
];

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Load environment variables
console.log('\n🔐 Checking environment variables:');
require('dotenv').config();

const requiredEnvVars = [
  'PORT',
  'FRONTEND_ORIGIN',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_SECRET',
  'FIREBASE_SERVICE_ACCOUNT_JSON'
];

const missingVars = [];
requiredEnvVars.forEach(varName => {
  const exists = !!process.env[varName];
  console.log(`  ${exists ? '✅' : '❌'} ${varName}`);
  if (!exists) missingVars.push(varName);
});

if (missingVars.length > 0) {
  console.log('\n❌ Missing environment variables:', missingVars.join(', '));
  console.log('   Add these to your .env file\n');
  process.exit(1);
}

// Test Firebase JSON parsing
console.log('\n🔥 Testing Firebase credentials:');
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  console.log('  ✅ Firebase JSON is valid');
  console.log('  ✅ Project ID:', serviceAccount.project_id);
} catch (error) {
  console.log('  ❌ Firebase JSON parsing failed:', error.message);
  console.log('  ❌ Check that FIREBASE_SERVICE_ACCOUNT_JSON is valid JSON');
  process.exit(1);
}

// Test Razorpay initialization
console.log('\n💳 Testing Razorpay initialization:');
try {
  const Razorpay = require('razorpay');
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
  });
  console.log('  ✅ Razorpay client initialized');
} catch (error) {
  console.log('  ❌ Razorpay initialization failed:', error.message);
  process.exit(1);
}

// Test required npm packages
console.log('\n📦 Checking npm packages:');
const requiredPackages = [
  'express',
  'cors',
  'helmet',
  'dotenv',
  'firebase-admin',
  'razorpay'
];

let packageErrors = 0;
requiredPackages.forEach(pkg => {
  try {
    require.resolve(pkg);
    console.log(`  ✅ ${pkg}`);
  } catch (error) {
    console.log(`  ❌ ${pkg} - not installed`);
    packageErrors++;
  }
});

if (packageErrors > 0) {
  console.log('\n❌ Run: npm install');
  process.exit(1);
}

// Try to start the server
console.log('\n🚀 Testing server startup:');
try {
  require('./server.js');
  console.log('  ✅ Server started successfully');
  console.log('\n✅ All checks passed! Backend is ready for deployment.\n');
  
  // Give server time to start, then exit
  setTimeout(() => {
    console.log('Diagnostic complete. Shutting down...');
    process.exit(0);
  }, 3000);
  
} catch (error) {
  console.log('  ❌ Server startup failed:', error.message);
  console.log('\nFull error:');
  console.error(error);
  process.exit(1);
}
