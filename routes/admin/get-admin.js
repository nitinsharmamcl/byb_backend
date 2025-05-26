const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [admins] = await db.query('SELECT id, name, email, password FROM admin');
    const [countResult] = await db.query('SELECT COUNT(*) AS totalAdmins FROM admin');
    const totalAdmins = countResult[0].totalAdmins;
    res.status(200).json({ admins: admins[0], totalAdmins, message: 'Admins fetched successfully' });
  } catch (err) {
    res.status(500).json({ err: err, message: 'Error while fetching admins' });
  }
});

module.exports = router; 