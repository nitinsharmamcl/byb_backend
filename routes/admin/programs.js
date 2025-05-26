const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { name, course_id } = req.body;
    if (!name || !course_id) {
      return res.status(400).json({ error: 'Program name and course_id are required.' });
    }
    await db.query('INSERT INTO programs (name, course_id) VALUES (?, ?)', [name, course_id]);
    res.status(200).json({ message: 'Program added successfully', program: { name, course_id } });
  } catch (error) {
    console.error('Error adding program:', error);
    res.status(500).json({ error: 'Failed to add program' });
  }
});

module.exports = router; 