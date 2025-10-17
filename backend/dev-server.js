const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/_health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Server is running in dev mode without database connection' }));

// Simple test routes
app.get('/api/test', (req, res) => {
  res.send('API is working!');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status || 500
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Dev server running on port ${PORT} without database connection`);
});