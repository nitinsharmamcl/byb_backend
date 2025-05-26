const express = require('express');
const db = require('../../config/db');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    const [user] = await db.query('UPDATE users SET application_submitted = 1 where email = ?', [email]);
    return res.json({ user: user[0], message: 'User fetched Successfully' });
  } catch (err) {
    return res.json({ err: err, message: 'Error while fetching User' });
  }
});

module.exports = router; 