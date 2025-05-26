const express = require('express');
const router = express.Router();

// Placeholder route for embassy
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Embassy API placeholder' });
});

module.exports = router; 