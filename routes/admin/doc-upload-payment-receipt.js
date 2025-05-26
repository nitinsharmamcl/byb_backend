const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.toLowerCase().endsWith('.pdf')) {
      return cb(new Error('payment_receipt must be a PDF'));
    }
    cb(null, true);
  }
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/', upload.single('payment_receipt'), async (req, res) => {
  try {
    const { email } = req.body;
    const filePath = req.file ? `/uploads/documents/${req.file.filename}` : null;
    if (!email || !filePath) {
      return res.status(400).json({ error: 'Email and payment_receipt PDF are required' });
    }
    const [userResult] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = userResult[0];
    await db.query('UPDATE users SET payment_receipt = ? WHERE email = ?', [filePath, email]);
    const attachments = [{ filename: 'payment_receipt.pdf', path: path.join(__dirname, '../../', filePath), contentType: 'application/pdf' }];
    const emailText = `Dear University Administration,\n\nPlease find attached the Payment Receipt for the following applicant:\n- Name: ${user.name}\n- Email: ${user.email}\n\nRegards,\nBringUrBuddy Team`;
    const mailOptions = {
      from: `"BringUrBuddy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Student Payment Receipt',
      text: emailText,
      attachments: attachments,
    };
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return res.status(500).json({ error: 'Failed to send email, but document was uploaded' });
    }
    res.status(201).json({ success: true, message: 'Payment receipt uploaded and email sent successfully' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 