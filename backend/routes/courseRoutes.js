const express = require('express');
const router = express.Router();

// Basic placeholder course routes
router.get('/', (req, res) => {
  res.json({ message: 'Course route placeholder' });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `Course details for ${id} (not implemented)` });
});

module.exports = router;
