const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Error while updating password', error: err.message });
  }
});

module.exports = router; 