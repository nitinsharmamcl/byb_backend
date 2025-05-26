const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { courseType, courseTrade, duration } = req.body;
    await db.query('INSERT INTO course_types (name) VALUES (?)', [courseType]);
    await db.query('INSERT INTO course_trades (trade, duration) VALUES (?, ?)', [courseTrade, duration]);
    res.status(200).json({ message: 'Course type and trade created successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error creating course type and trade', error });
  }
});

module.exports = router; 