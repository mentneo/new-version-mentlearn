// Middleware
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
// const mongoose = require('mongoose'); // Removed MongoDB
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const { WebSocketServer } = require('ws');

// Config
const PORT = parseInt(process.env.PORT, 10) || 5001;
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000').split(',').map(s => s.trim());
const MAX_HEADER_BYTES = parseInt(process.env.MAX_HEADER_BYTES || String(16 * 1024), 10); // 16KB
const JSON_LIMIT = process.env.JSON_LIMIT || '10mb'; // body size limit

// === Firebase Admin init (env fallback to file) ===
let serviceAccount = null;
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try { serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON); } catch(e) { console.warn('Invalid FIREBASE_SERVICE_ACCOUNT_JSON'); }
}
if (!serviceAccount && process.env.FIREBASE_CREDENTIALS_PATH) {
  const credPath = process.env.FIREBASE_CREDENTIALS_PATH;
  const resolvedPath = credPath.startsWith('/') ? credPath : __dirname + '/' + credPath;
  if (fs.existsSync(resolvedPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    console.log('✅ Firebase credentials loaded from:', credPath);
  }
}
if (!serviceAccount) {
  const localPath = __dirname + '/firebase-service-account.json';
  if (fs.existsSync(localPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(localPath, 'utf8'));
  }
}
if (!serviceAccount) {
  console.error('❌ Missing Firebase service account. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_CREDENTIALS_PATH in .env');
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// Firestore Database
const db = admin.firestore();

// === Razorpay client ===
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
  console.warn('Razorpay keys missing. Set RAZORPAY_KEY_ID and RAZORPAY_SECRET in env to create real orders.');
}
const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test', key_secret: process.env.RAZORPAY_SECRET || 'secret' });

// === Express app ===
const app = express();

// Configure Helmet to work with Render and proxies
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Trust proxy (required for Render)
app.set('trust proxy', 1);

// Allow Render host headers
app.use((req, res, next) => {
  const host = req.get('host');
  const allowedHosts = [
    'localhost:5001',
    'localhost:10000',
    'new-version-mentlearn-3.onrender.com',
    /.*\.onrender\.com$/
  ];
  
  const isAllowed = allowedHosts.some(allowed => {
    if (allowed instanceof RegExp) {
      return allowed.test(host);
    }
    return host === allowed;
  });
  
  if (!isAllowed && host) {
    console.warn('Invalid host header:', host);
  }
  
  next();
});

app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// CORS: allow configured frontend(s) and respond to preflight
const corsOptions = {
  origin: function(origin, cb) {
    try {
      // allow requests with no origin (curl, server-to-server)
      if (!origin) return cb(null, true);
      const allowed = FRONTEND_ORIGINS.includes(origin);
      if (!allowed) console.warn('CORS blocked origin:', origin);
      return cb(null, allowed);
    } catch (e) {
      console.warn('CORS origin check error', e && e.message);
      return cb(null, false);
    }
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight

// Handle CORS failures gracefully (return 403 instead of 500)
app.use((err, req, res, next) => {
  if (err && err.message && err.message.indexOf('CORS') !== -1) {
    return res.status(403).json({ error: 'CORS not allowed' });
  }
  next(err);
});

// Header-size protection middleware (rejects with 431)
app.use((req, res, next) => {
  try {
    const headerSize = Object.entries(req.headers).reduce((s, [k, v]) => s + k.length + String(v).length, 0);
    if (headerSize > MAX_HEADER_BYTES) {
      console.warn(`Rejecting ${req.method} ${req.path} - headers too large: ${headerSize} bytes`);
      return res.status(431).json({ error: 'Request headers too large' });
    }
  } catch (e) {
    // ignore and continue
  }
  next();
});

// === Import Routes ===
const razorpayRoutes = require('./routes/razorpayRoutes');

// Health endpoints
app.get('/_health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// === Mount Routes ===
app.use('/api/razorpay', razorpayRoutes);

// Fallback 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && (err.stack || err.message));
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// Start HTTP server (pass maxHeaderSize when supported)
let server;
try {
  server = http.createServer({ maxHeaderSize: MAX_HEADER_BYTES }, app);
} catch (e) {
  server = http.createServer(app);
}
server.listen(PORT, '0.0.0.0', () => console.log(`✅ Server listening on 0.0.0.0:${PORT} (maxHeaderSize=${MAX_HEADER_BYTES})`));

// WebSocket server at /ws
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log('WS connected from', ip);
  ws.on('close', (code, reason) => console.log('WS closed from', ip, 'code', code, 'reason', reason && reason.toString()));
  ws.on('error', (err) => console.warn('WS error from', ip, err && err.message));
});