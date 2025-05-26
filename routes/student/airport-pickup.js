const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const db = require('../../config/db');

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'public', 'airport-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-photo_document-' + file.originalname);
  },
});
const upload = multer({ storage });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/', upload.single('photo_document'), async (req, res) => {
  try {
    const { email } = req.body;
    const photo_document = req.file ? `/airport-images/${req.file.filename}` : null;
    const [users] = await db.query('SELECT id, name, email FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];
    const [prev] = await db.query('select * from airport_pickup where user_id = ?', [user.id]);
    if (prev[0]?.user_id === user.id) {
      await db.query('UPDATE airport_pickup SET photo_document = ? WHERE user_id = ?', [photo_document, user.id]);
    } else {
      await db.query('INSERT into airport_pickup (user_id, photo_document) values(?, ?);', [user.id, photo_document]);
    }
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Airport Pickup Photo Document',
        html: `<p>Dear <strong>Agent</strong>,</p><p>The photo document for user <strong>${user.name}</strong> has been uploaded.</p><p>See the attached file.</p><p>Best Regards,<br><strong>BringUrBuddy Team</strong></p>`,
        attachments: [
          {
            filename: path.basename(photo_document),
            path: path.join(process.cwd(), 'public', photo_document),
          },
        ],
      });
    } catch (emailError) {
      console.error('Email Sending Error:', emailError);
      return res.status(500).json({ error: 'User registered but failed to send OTP email.' });
    }
    return res.json({ message: 'success' });
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 