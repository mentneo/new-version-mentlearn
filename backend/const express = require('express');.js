const express = require('express');
const router = express.Router();

// Placeholder endpoints
router.get('/', (req, res) => {
  res.json({ message: 'Course list placeholder' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Course details placeholder for ${req.params.id}` });
});

module.exports = router;
