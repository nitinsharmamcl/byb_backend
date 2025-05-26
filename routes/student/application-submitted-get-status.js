const express = require('express');
const db = require('../../config/db');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    const [status] = await db.query('Select application_submitted from users where email = ?', [email]);
    return res.json({ status: status[0], message: 'application_submitted fetched Successfully' });
  } catch (err) {
    return res.json({ err: err, message: 'Error while fetching application_submitted' });
  }
});

module.exports = router; 