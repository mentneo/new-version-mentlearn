// ...existing code...

exports.getCreateNotification = async (req, res) => {
  try {
    res.render('admin/create-notification', {
      title: 'Create Notification',
      path: '/admin/create-notification',
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