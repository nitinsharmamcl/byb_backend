const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const db = require('../../config/db');

const router = express.Router();

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
    const { user_id, university_email, cc_email } = req.body;
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const [rows] = await db.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.tenth_certificate, 
        u.twelfth_certificate,
        u.payment_receipt,
        u.id_proof,
        u.offer_letter,
        u.bonafide_letter,
        u.admission_letter,
        u.ugc_letter,
        u.visa,
        u.affiliation_letter,
        u.university_id,
        p.name AS program_name,
        un.name AS university_name,
        ct.name AS trade_name,
        c.name AS country_name
      FROM users u
      LEFT JOIN programs p ON u.program_id = p.id
      LEFT JOIN universities un ON u.university_id = un.id
      LEFT JOIN course_trades ct ON u.course_trade_id = ct.id
      LEFT JOIN countries c ON u.country_id = c.id
      WHERE u.id = ?
    `,
      [user_id]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = rows[0];
    const attachmentFields = [
      'tenth_certificate',
      'twelfth_certificate',
      'id_proof',
      'payment_receipt',
      'offer_letter',
      'bonafide_letter',
      'visa',
      'admission_letter',
      'ugc_letter',
      'affiliation_letter'
    ];
    const attachments = attachmentFields
      .filter((field) => user[field])
      .map((field) => {
        const relativePath = user[field];
        const fullPath = path.join(
          process.cwd(),
          'public',
          relativePath.replace(/^\/+/g, '')
        );
        return {
          filename: field === 'id_proof'
            ? `passport.${fullPath.split('.').pop()}`
            : `${field.replace(/_/g, ' ')}.${fullPath.split('.').pop()}`,
          path: fullPath,
        };
      });
    const emailText = `
Dear ${user.university_name},

Please find below the applicant's essential academic and financial documents.

- Name: ${user.name}
- Email: ${user.email}
- Program: ${user.program_name}
- University: ${user.university_name}
- Trade: ${user.trade_name}
- Country: ${user.country_name}

Attached are:
${attachments.map((att) => `- ${att.filename}`).join('\n')}

Regards,  \nBringUrBuddy Team
`;
    const mailOptions = {
      from: `"BringUrBuddy" <${process.env.EMAIL_USER}>`,
      to: university_email,
      cc: cc_email,
      subject: 'Request for Admission Letter',
      text: emailText,
      attachments,
    };
    await transporter.sendMail(mailOptions);
    return res.json({
      message: `Email sent to university at ${university_email}`,
      success: true,
    });
  } catch (err) {
    console.error('Email Error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router; 