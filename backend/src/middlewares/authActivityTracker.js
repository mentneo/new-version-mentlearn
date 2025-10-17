/**
 * Auth Middleware for User Controller
 * Automatically tracks authentication activities
 */
 
const ActivityService = require('../services/ActivityService');

exports.trackAuthActivity = (activityService) => async (req, res, next) => {
  // Store the original send method
  const originalSend = res.send;
  
  // Override the send method
  res.send = function (body) {
    try {
      // Parse the body if it's a string
      let parsedBody;
      if (typeof body === 'string') {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          // If it's not valid JSON, use the original body
          parsedBody = body;
        }
      } else {
        parsedBody = body;
      }
      
      // If the response contains a user object and is successful
      if (parsedBody && parsedBody.user && res.statusCode >= 200 && res.statusCode < 300) {
        const user = parsedBody.user;
        let activityType;
        
        // Determine if it's a login or registration based on the original URL
        if (req.originalUrl.includes('/login')) {
          activityType = 'login';
        } else if (req.originalUrl.includes('/register')) {
          activityType = 'signup';
        }
        
        if (activityType && user._id) {
          // Track the activity asynchronously
          activityService.trackActivity({
            userId: user._id,
            activityType,
            data: {
              email: user.email,
              name: user.name
            },
            ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            userAgent: req.headers['user-agent']
          }).catch(err => {
            console.error(`Error tracking ${activityType} activity:`, err);
          });
        }
      }
    } catch (err) {
      console.error('Error in auth activity tracking middleware:', err);
    }
    
    // Call the original send method
    return originalSend.call(this, body);
  };
  
  next();
};