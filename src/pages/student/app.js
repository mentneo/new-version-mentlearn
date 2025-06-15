// Import routes
const notificationRoutes = require('./routes/notification.route');

// Mount routes
app.use('/api/v1/notifications', notificationRoutes);