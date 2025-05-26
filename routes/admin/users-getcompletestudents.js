const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [students] = await db.query('SELECT * FROM users WHERE status = "complete"');
    res.status(200).json({ students });
  } catch (error) {
    console.error('Error fetching complete students:', error);
    res.status(500).json({ error: 'Failed to fetch complete students' });
  }
});

 module.exports = router; 