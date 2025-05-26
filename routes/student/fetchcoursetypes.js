const express = require('express');
const db = require('../../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM course_types ');
    return res.json({ result: result, message: 'Course types fetched Successfully' });
  } catch (error) {
    return res.json({ error: 'error in fetching course trade', message: error?.message });
  }
});

module.exports = router; 