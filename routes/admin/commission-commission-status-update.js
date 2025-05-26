const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { user_id } = req.body;
    await db.query('UPDATE commission SET status = ? WHERE user_id = ?', [1, user_id]);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Internal Error' });
  }
});

module.exports = router; 