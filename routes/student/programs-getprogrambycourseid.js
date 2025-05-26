const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { id } = req.body;
    const [program] = await db.query('SELECT * FROM programs where course_id = ?', [id]);
    return res.status(200).json({ programs: program });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 