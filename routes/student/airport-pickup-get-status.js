const express = require('express');
const db = require('../../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { user_id } = req.body;
    const [users] = await db.query('SELECT * from airport_pickup WHERE user_id = ?', [user_id]);
    if (!users.length) {
      return res.json({ users });
    } else {
      return res.status(200).json({ users });
    }
  } catch (err) {
    return res.status(200).json({ error: 'Internal Error ' });
  }
});

module.exports = router; 