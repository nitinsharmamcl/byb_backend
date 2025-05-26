const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM users WHERE payment_status = 1');
    res.status(200).json({ students: result, message: 'Paid students fetched successfully' });
  } catch (error) {
    console.error('Error fetching paid students:', error);
    res.status(500).json({ error: 'Failed to fetch paid students' });
  }
});

module.exports = router; 