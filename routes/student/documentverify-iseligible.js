const express = require('express');
const db = require('../../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    await db.query('UPDATE users SET is_eligible = ? WHERE email = ?', [1, email]);
    return res.status(200).json({ success: true, message: 'eligible updated successfully' });
  } catch (error) {
    console.error('Error updating offer letter status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update eligible status' });
  }
});

module.exports = router; 