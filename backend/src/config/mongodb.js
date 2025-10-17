const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * @param {string} mongoUri - MongoDB connection string
 * @returns {Promise<mongoose.Connection>} Mongoose connection object
 */
const connectMongo = async (mongoUri) => {
  if (!mongoUri) throw new Error('MONGODB_URI not provided');
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    return mongoose.connection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
};

// Export the connection function and mongoose for use elsewhere
module.exports = {
  connectMongo,
  mongoose
};
