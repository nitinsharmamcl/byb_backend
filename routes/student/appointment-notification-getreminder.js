const express = require('express');
const db = require('../../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id } = req.body;
    const [reminders] = await db.query('SELECT appointment_date, appointment_time FROM reminder WHERE user_id = ?', [id]);
    return res.json({ reminders: reminders[0] });
  } catch (err) {
    return res.json({ err: err, reminders: [] });
  }
});

module.exports = router; 