const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('SELECT * FROM payments WHERE user_id = ?', [id]);
    res.status(200).json({ payments: result, message: 'Payments fetched successfully' });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

module.exports = router; 