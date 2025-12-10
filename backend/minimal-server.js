#!/usr/bin/env node

/**
 * Minimal server to test Render deployment
 * This will help diagnose environment variable issues
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      port: PORT,
      hasFrontendOrigin: !!process.env.FRONTEND_ORIGIN,
      hasRazorpayKey: !!process.env.RAZORPAY_KEY_ID,
      hasRazorpaySecret: !!process.env.RAZORPAY_SECRET,
      hasFirebaseJson: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
      firebaseJsonLength: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? process.env.FIREBASE_SERVICE_ACCOUNT_JSON.length : 0
    }
  });
});

app.get('/api/debug', (req, res) => {
  // Only show this in production for debugging
  if (process.env.NODE_ENV !== 'production') {
    return res.status(403).json({ error: 'Not available in this environment' });
  }
  
  res.json({
    envVars: {
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
      FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'SET' : 'MISSING',
      RAZORPAY_SECRET: process.env.RAZORPAY_SECRET ? 'SET' : 'MISSING',
      FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? `SET (${process.env.FIREBASE_SERVICE_ACCOUNT_JSON.substring(0, 50)}...)` : 'MISSING'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on 0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
