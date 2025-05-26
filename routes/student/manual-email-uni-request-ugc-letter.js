const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../../config/db');
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
  try {
    const { user_id, university_email, cc_email } = req.body;
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const [rows] = await db.query(
      `SELECT \
        u.id, u.name, u.email, u.tenth_certificate, u.twelfth_certificate, u.payment_receipt, u.id_proof, u.offer_letter, u.bonafide_letter, u.admission_letter, u.ugc_letter, u.visa, u.affiliation_letter, u.university_id, p.name AS program_name, un.name AS university_name, ct.name AS trade_name, c.name AS country_name\n      FROM users u\n      LEFT JOIN programs p ON u.program_id = p.id\n      LEFT JOIN universities un ON u.university_id = un.id\n      LEFT JOIN course_trades ct ON u.course_trade_id = ct.id\n      LEFT JOIN countries c ON u.country_id = c.id\n      WHERE u.id = ?`,
      [user_id]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = rows[0];
    // Prepare attachments
    const attachmentFields = [
      'tenth_certificate',
      'twelfth_certificate',
      'id_proof',
      'payment_receipt',
      'offer_letter',
    ];
    const attachments = attachmentFields
      .filter((field) => user[field])
      .map((field) => {
        const relativePath = user[field];
        const fullPath = path.join(__dirname, '../../uploads', relativePath.replace(/^\/+/g, ''));
        return {
          filename: field === 'id_proof'
            ? `passport.${fullPath.split('.').pop()}`
            : `${field.replace(/_/g, ' ')}.${fullPath.split('.').pop()}`,
          path: fullPath,
        };
      });
    const emailText = `\nDear ${user.university_name},\n\nPlease find below the applicant's essential academic and financial documents.\n\n- Name: ${user.name}\n- Email: ${user.email}\n- Program: ${user.program_name}\n- University: ${user.university_name}\n- Trade: ${user.trade_name}\n- Country: ${user.country_name}\n\nAttached are:\n${attachments.map((att) => `- ${att.filename}`).join('\n')}\n\nRegards,  \nBringUrBuddy Team\n`;
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: `"BringUrBuddy" <${process.env.EMAIL_USER}>`,
      to: university_email,
      cc: cc_email,
      subject: 'Request for UGC Letter',
      text: emailText,
      attachments,
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: `Email sent to university at ${university_email}`, success: true });
  } catch (err) {
    console.error('Email Error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router; 