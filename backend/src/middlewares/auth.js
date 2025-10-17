const User = require('../models/User');

/**
 * Authentication middleware
 * This is a simple implementation for demonstration purposes
 * In a production app, you'd use JWT or sessions
 */
module.exports = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    // Extract token (in a real app, this would be a JWT)
    // For simplicity, we'll assume the token is the user ID
    const userId = authHeader.split(' ')[1];
    
    // Find the user
    const user = await User.findById(userId);
    
    // If user not found or not active
    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'Invalid or expired token'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      message: 'Authentication failed'
    });
  }
};