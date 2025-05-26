const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await db.query(
      'SELECT offer_letter_status FROM users WHERE email = ?',
      [email]
    );
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to fetch offer letters' });
  }
});

module.exports = router; 