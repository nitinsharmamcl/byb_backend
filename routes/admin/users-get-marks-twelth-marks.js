const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { twelth_id } = req.body;
    const [twelth_marks] = await db.query('SELECT * FROM twefth_marks WHERE id = ?', [twelth_id]);
    res.status(200).json({ twelth_marks, message: 'twelth_marks fetched successfully' });
  } catch (error) {
    console.error('Error fetching twelth_marks:', error);
    res.status(500).json({ error: 'Failed to fetch twelth_marks' });
  }
});

module.exports = router; 