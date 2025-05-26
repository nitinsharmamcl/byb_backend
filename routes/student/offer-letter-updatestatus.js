const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    await db.query(
      'UPDATE users SET offer_letter_status = ? WHERE email = ?',
      [1, email]
    );
    return res.status(200).json({ success: true, message: 'Offer letter status updated successfully' });
  } catch (error) {
    console.error('Error updating offer letter status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update offer letter status' });
  }
});

module.exports = router; 