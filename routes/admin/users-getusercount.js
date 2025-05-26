const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [result] = await db.query('SELECT COUNT(*) AS userCount FROM users');
    const userCount = result[0].userCount;
    res.status(200).json({ userCount, message: 'User count fetched successfully' });
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({ error: 'Failed to fetch user count' });
  }
});

module.exports = router; 