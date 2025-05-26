const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const [users] = await db.query('SELECT id, name, email, profile_img, university_id,program_id, phone_number, offer_letter_status, document_verified_status,password, is_verified FROM users WHERE email = ?', [email]);
    if (!users[0]) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = users[0];
    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    return res.status(200).json({ message: 'success', user });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 