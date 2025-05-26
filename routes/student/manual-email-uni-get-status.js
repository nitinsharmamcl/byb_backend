const express = require('express');
const db = require('../../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { user_id } = req.body;
    const [status] = await db.query('select uni_email_status from users WHERE id = ?', [user_id]);
    return res.status(200).json({ status: status[0] });
  } catch (err) {
    return res.status(400).json({ error: 'Internal Error ' });
  }
});

module.exports = router; 