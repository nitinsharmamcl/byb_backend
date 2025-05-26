const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [students] = await db.query('SELECT * FROM users WHERE payment_status = 1');
    res.status(200).json({ students });
  } catch (error) {
    console.error('Error fetching students with paid fees:', error);
    res.status(500).json({ error: 'Failed to fetch students with paid fees' });
  }
});

module.exports = router; 