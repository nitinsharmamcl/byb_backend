const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const path = require('path');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/', async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const [rows] = await db.query(`SELECT u.id, u.name, u.email, u.tenth_certificate, u.twelfth_certificate, u.payment_receipt, u.id_proof, u.offer_letter, u.bonafide_letter, u.admission_letter, u.ugc_letter, u.visa, u.affiliation_letter, u.university_id, p.name AS program_name, un.name AS university_name, ct.name AS trade_name, c.name AS country_name FROM users u LEFT JOIN programs p ON u.program_id = p.id LEFT JOIN universities un ON u.university_id = un.id LEFT JOIN course_trades ct ON u.course_trade_id = ct.id LEFT JOIN countries c ON u.country_id = c.id WHERE u.id = ?`, [user_id]);
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = rows[0];
    const attachmentFields = ['tenth_certificate', 'twelfth_certificate', 'id_proof', 'payment_receipt', 'offer_letter', 'bonafide_letter', 'admission_letter', 'ugc_letter', 'affiliation_letter'];
    const attachments = attachmentFields.filter(field => user[field]).map(field => {
      const relativePath = user[field];
      const fullPath = path.join(process.cwd(), 'public', relativePath.replace(/^\/+/g, ''));
      return {
        filename: field === 'id_proof' ? `passport.${fullPath.split('.').pop()}` : `${field.replace(/_/g, ' ')}.${fullPath.split('.').pop()}`,
        path: fullPath,
      };
    });
    const emailText = `Dear Admin,\n\nCommission has been claimed by the agent successfully. Please find the details below:\n-Student Name: ${user.name}\n-Student Email: ${user.email}\n-Student Country: ${user.country_name}\n\nAttached are:\n${attachments.map(att => `- ${att.filename}`).join('\n')}\n\nRegards,\nBringUrBuddy Team`;
    const mailOptions = {
      from: `"BringUrBuddy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Commission Claimed by agent successfully',
      text: emailText,
      attachments,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router; 