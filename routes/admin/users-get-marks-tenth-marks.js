const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { tenth_id } = req.body;
    const [tenth_marks] = await db.query('SELECT * FROM tenth_marks WHERE id = ?', [tenth_id]);
    res.status(200).json({ tenth_marks, message: 'tenth_marks fetched successfully' });
  } catch (error) {
    console.error('Error fetching tenth_marks:', error);
    res.status(500).json({ error: 'Failed to fetch tenth_marks' });
  }
});

module.exports = router; 