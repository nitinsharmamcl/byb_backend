const express = require('express');
const db = require('../../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email are required' });
    }
    const [result] = await db.query('select payment_status from users where email = ?', [email]);
    return res.json({
      message: 'success',
      data: result[0]
    });
  } catch (error) {
    console.error('Error getting payment info:', error);
    return res.status(500).json({ error: 'Failed ' });
  }
});

module.exports = router; 