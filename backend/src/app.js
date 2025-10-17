const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const { connectMongo } = require('./config/mongodb');
const initFirebase = require('./config/firebase');

const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const progressRoutesFactory = require('./routes/progress');
const demoRoutesFactory = require('./routes/demo');
const activitiesRoutesFactory = require('./routes/activities');
// We'll uncomment this when the users route file is created
// const userRoutes = require('./routes/users');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/_health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// Database init (do not block module load; expose connect function)
app.connect = async () => {
  // Mongo
  const mongoConnection = await connectMongo(process.env.MONGODB_URI);
  // Firebase / Firestore
  const firestore = initFirebase();

  // Add DB info to app for potential use
  app.locals.db = {
    mongo: mongoConnection,
    firestore: firestore
  };

  // Mount routes that need firestore factory
  app.use('/api/progress', progressRoutesFactory(firestore));
  app.use('/api/demo-bookings', demoRoutesFactory(firestore));
  app.use('/api/activities', activitiesRoutesFactory(firestore));
  
  // Initialize activity tracking service
  const ActivityService = require('./services/ActivityService');
  const activityService = new ActivityService(firestore);
  app.locals.services = {
    activityService
  };
};

// Mount simple routes that don't require firestore instance
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
// We'll uncomment this when the users route file is created
// app.use('/api/users', userRoutes);

// API health check
app.get('/api/health', (req, res) => res.json({ 
  status: 'ok', 
  uptime: process.uptime(),
  timestamp: new Date().toISOString()
}));

// API test route
app.get('/api/test', (req, res) => res.json({ message: 'API is working correctly' }));

// Error handler
app.use(errorHandler);

module.exports = app;
