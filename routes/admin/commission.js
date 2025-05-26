const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { user_id, commission } = req.body;
    const [commissions] = await db.query(
      'INSERT INTO commission (user_id, amount) VALUES (?, ?)',
      [user_id, commission]
    );
    res.status(200).json({ commission: commissions[0] });
  } catch (err) {
    res.status(400).json({ error: 'Internal Error' });
  }
});

module.exports = router; 