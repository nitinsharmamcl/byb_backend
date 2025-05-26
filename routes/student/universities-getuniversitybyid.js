const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { id } = req.body;
    const [university] = await db.query('SELECT * FROM universities where id = ?', [id]);
    return res.status(200).json({ university: university[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 