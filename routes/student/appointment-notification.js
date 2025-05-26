const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const db = require('../../config/db');


const router = express.Router();

const uploadDir = path.join(process.cwd(), 'public', 'embassy');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-date_document-' + file.originalname);
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

router.post('/', upload.single('date_document'), async (req, res) => {
  try {
    const { email, date: appointment_date, time: appointment_time } = req.body;
    const date_document = req.file ? `/embassy/${req.file.filename}` : null;
    const [users] = await db.query('SELECT id, name, email FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];
    const [prev] = await db.query('select * from reminder where user_id = ?;', [user.id]);
    if (prev[0]?.user_id === user.id) {
      await db.query('UPDATE reminder SET appointment_date = ?,appointment_time = ?, date_document = ? WHERE user_id = ?;', [appointment_date, appointment_time, date_document, user.id]);
    } else {
      await db.query('INSERT into reminder (user_id, appointment_date,appointment_time, date_document) values(?, ?,?, ?);', [user.id, appointment_date, appointment_time, date_document]);
    }
    await transporter.sendMail({
      from: `"BringUrBuddy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Appointment Reminder - BringUrBuddy',
      html: `<p>Dear <strong>${user.name}</strong>,</p><p>This is a reminder for your upcoming appointment after the embassy.</p><p><strong>Appointment Date:</strong> ${appointment_date} at ${appointment_time}</p><p>Please ensure you are prepared and on time.</p><p>Best Regards,<br><strong>BringUrBuddy Team</strong></p>`,
    });
    return res.json({ message: 'success', data: appointment_date });
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 