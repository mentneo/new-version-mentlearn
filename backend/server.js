// (Top preamble removed - consolidated below)
import cors from 'cors';

app.use(cors({
  origin: ['http://localhost:3000'], // frontend origin
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true,
}));
// Middleware
require('dotenv').config();
const fs = require('fs');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
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
if (!serviceAccount) {
  const localPath = __dirname + '/firebase-service-account.json';
  if (fs.existsSync(localPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(localPath, 'utf8'));
  }
}
if (!serviceAccount) {
  console.error('Missing Firebase service account. Set FIREBASE_SERVICE_ACCOUNT_JSON or add firebase-service-account.json');
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// === MongoDB (Mongoose) ===
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mentneo';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err && err.message));

mongoose.connection.on('error', err => {
  console.error('MongoDB event error:', err && err.message);
});

// Minimal models (move to separate files in production)
const { Schema } = mongoose;
const CourseSchema = new Schema({ title: String, price: { type: Number, required: true }, thumbnailUrl: String }, { timestamps: true });
const OrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  amount: Number,
  currency: { type: String, default: 'INR' },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  createdBy: String,
  status: { type: String, default: 'created' }
}, { timestamps: true });
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// === Razorpay client ===
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
  console.warn('Razorpay keys missing. Set RAZORPAY_KEY_ID and RAZORPAY_SECRET in env to create real orders.');
}
const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test', key_secret: process.env.RAZORPAY_SECRET || 'secret' });

// === Express app ===
const app = express();
app.use(helmet());
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

// Health endpoints
app.get('/_health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Helper to read Bearer token
function getBearerToken(req) {
  const h = req.headers.authorization || '';
  const parts = String(h).split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
  return null;
}

// === Payment route ===
// POST /api/payment/create-order
// body: { courseId: "<mongo id>" }
// Auth: Firebase ID token in Authorization: Bearer <token>
app.post('/api/payment/create-order', async (req, res) => {
  console.log('POST /api/payment/create-order from', req.ip || req.headers['x-forwarded-for'] || 'unknown');
  try {
    const { courseId } = req.body || {};
    if (!courseId) return res.status(400).json({ error: 'Missing courseId' });

    // verify token
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: 'Missing auth token' });

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (err) {
      console.warn('Invalid ID token:', err && err.message);
      return res.status(401).json({ error: 'Invalid auth token' });
    }

    // find course
    const course = await Course.findById(courseId).lean();
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const price = Number(course.price || 0);
    if (!Number.isFinite(price) || price <= 0) return res.status(400).json({ error: 'Invalid course price' });

    const amountPaise = Math.round(price * 100);
    if (amountPaise < 100) return res.status(400).json({ error: 'Amount below minimum allowed' });

    const receipt = `rcpt_${courseId}_${Date.now()}`.slice(0, 40);
    const orderOptions = { amount: amountPaise, currency: 'INR', receipt, payment_capture: 1 };

    // Create razorpay order (in test mode if using test keys)
    const order = await razorpay.orders.create(orderOptions);

    // Save order locally
    await Order.create({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseId: course._id,
      createdBy: decoded.uid,
      status: 'created'
    });

    return res.json({ order });
  } catch (err) {
    console.error('create-order error:', err && (err.stack || err.message));
    return res.status(500).json({ error: 'Internal server error' });
  }
});

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
server.listen(PORT, () => console.log(`Server listening on ${PORT} (maxHeaderSize=${MAX_HEADER_BYTES})`));

// WebSocket server at /ws
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log('WS connected from', ip);
  ws.on('close', (code, reason) => console.log('WS closed from', ip, 'code', code, 'reason', reason && reason.toString()));
  ws.on('error', (err) => console.warn('WS error from', ip, err && err.message));
});