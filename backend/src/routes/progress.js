const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

module.exports = (firestore) => {
  router.get('/', progressController.getProgress(firestore));
  router.post('/', progressController.syncProgress(firestore));
  return router;
};
