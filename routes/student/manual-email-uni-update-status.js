const express = require('express');
const db = require('../../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { user_id } = req.body;
    await db.query('UPDATE users SET uni_email_status = 1 WHERE id = ?', [user_id]);
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    return res.status(400).json({ error: 'Internal Error ' });
  }
});

module.exports = router; 