const express = require('express');
const db = require('../../config/db');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email are required' });
    }
    const [result] = await db.query('UPDATE users SET payment_status = 1 WHERE email = ?', [email]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or no update made' });
    }
    return res.json({
      message: 'success',
      data: result[0]
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({ error: 'Failed to update payment status' });
  }
});

module.exports = router; 