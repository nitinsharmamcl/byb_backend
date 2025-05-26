const express = require('express');
const db = require('../../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    const [status] = await db.query('Select is_eligible from users where email = ?', [email]);
    return res.json({ status: status[0], message: 'User fetched Successfully' });
  } catch (err) {
    return res.json({ err: err, message: 'Error while fetching User' });
  }
});

module.exports = router; 