const Student = require('../models/Student');

// ...existing code...

exports.getNotifications = async (req, res) => {
  try {
    res.render('student/notifications', {
      title: 'Notifications',
      path: '/student/notifications',
      user: req.user
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ...existing code...