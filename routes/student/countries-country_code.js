const express = require('express');
const db = require('../../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [codes] = await db.query('SELECT * FROM country_code');
    return res.status(200).json(codes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 