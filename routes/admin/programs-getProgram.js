const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [programs] = await db.query('SELECT * FROM programs');
    res.status(200).json({ message: 'Programs fetched successfully', programs });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

module.exports = router; 