const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { id } = req.body;
    const [university] = await db.query('SELECT * FROM universities where id = ?', [id]);
    const [programs] = await db.query('SELECT * FROM programs where id = ?', university[0].program_id);
    return res.status(200).json({ programs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 