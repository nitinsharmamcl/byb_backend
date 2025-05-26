const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = users[0];
    const isPasswordValid = password == user.password;
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router; 