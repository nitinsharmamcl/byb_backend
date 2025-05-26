const express = require('express');
const nodemailer = require('nodemailer');
const db = require('../../config/db');

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Missing email or OTP' });
    }
    const [users] = await db.query('SELECT id, name, email,profile_img, phone_number, offer_letter_status, otp, otp_expires_at FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(400).json({ error: 'User not found' });
    }
    const user = users[0];
    if (user.otp !== otp.toString()) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }
    await db.query('UPDATE users SET is_verified = 1 WHERE email = ?', [email]);
    try {
      await transporter.sendMail({
        from: `"BringUrBuddy" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your Login Credentials - BringUrBuddy',
        html: `<p>Dear <strong>${user.name}</strong>,</p><p>Your account has been successfully verified.</p><p>Here are your login details:</p><ul><li><strong>Email:</strong> ${user.email}</li><li><strong>Password:</strong> (Use the password you set during registration)</li></ul><p>If you forgot your password, you can reset it.</p><p>Best Regards,<br><strong>BringUrBuddy Team</strong></p>`,
      });
      return res.json({ message: 'success', user });
    } catch (emailError) {
      console.error('Email Sending Error:', emailError);
      return res.status(500).json({ error: 'OTP verified, but failed to send email.' });
    }
  } catch (error) {
    console.error('OTP Verification Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 