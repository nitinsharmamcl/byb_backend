const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM users WHERE document_verified_status = 0');
    res.status(200).json({ users: result, message: 'Not eligible users fetched successfully' });
  } catch (error) {
    console.error('Error fetching not eligible users:', error);
    res.status(500).json({ error: 'Failed to fetch not eligible users' });
  }
});

module.exports = router; 