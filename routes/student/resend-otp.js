const express = require('express');
const nodemailer = require('nodemailer');
const db = require('../../config/db');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    await db.query('UPDATE users SET otp = ?, otp_expires_at = ? WHERE email = ?', [otp, otpExpiresAt, email]);
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your OTP Code - BringUrBuddy',
      html: `<p>Dear User,</p><p>Your OTP code is: <strong>${otp}</strong></p><p>This OTP is valid for 10 minutes.</p><p>Best Regards,<br><strong>BringUrBuddy Team</strong></p>`,
    });
    return res.json({ message: 'success' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 