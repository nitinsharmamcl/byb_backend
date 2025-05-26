const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM users WHERE document_verified_status = 1');
    res.status(200).json({ users: result, message: 'Eligible users fetched successfully' });
  } catch (error) {
    console.error('Error fetching eligible users:', error);
    res.status(500).json({ error: 'Failed to fetch eligible users' });
  }
});

module.exports = router; 