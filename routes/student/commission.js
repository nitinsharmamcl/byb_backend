const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../../config/db');
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
  const { user_id, agent_id, commission, email, cc } = req.body;
  if (!user_id || commission === undefined) {
    return res.status(400).json({ message: 'userId and commission are required.' });
  }
  try {
    const [rows] = await db.query(`SELECT u.id, u.name, u.email, u.tenth_certificate, u.twelfth_certificate, u.payment_receipt, u.id_proof, u.offer_letter, u.bonafide_letter, u.admission_letter, u.ugc_letter, u.visa, u.affiliation_letter, u.university_id, p.name AS program_name, un.name AS university_name, ct.name AS trade_name, c.name AS country_name FROM users u LEFT JOIN programs p ON u.program_id = p.id LEFT JOIN universities un ON u.university_id = un.id LEFT JOIN course_trades ct ON u.course_trade_id = ct.id LEFT JOIN countries c ON u.country_id = c.id WHERE u.id = ?`, [user_id]);
    const user = rows[0];
    const [uni_payment] = await db.query('select * from uni_payments where user_id = ?', [user_id]);
    const university_payment_recipet = uni_payment[0]?.payment_document;
    const attachmentFields = [
      'tenth_certificate',
      'twelfth_certificate',
      'id_proof',
      'payment_receipt',
      'bonafide_letter',
      'offer_letter',
      'admission_letter',
      'ugc_letter',
      'visa',
      'affliation_letter',
    ];
    const attachments = attachmentFields
      .filter((field) => user[field])
      .map((field) => {
        const relativePath = user[field];
        const fullPath = path.join(process.cwd(), 'public', relativePath.replace(/^\/+/g, ''));
        return {
          filename: `${field.replace(/_/g, ' ')}.${fullPath.split('.').pop()}`,
          path: fullPath,
        };
      });
    if (university_payment_recipet) {
      const uniPaymentFullPath = path.join(process.cwd(), 'public', university_payment_recipet.replace(/^\/+/g, ''));
      attachments.push({
        filename: `university_payment_receipt.${uniPaymentFullPath.split('.').pop()}`,
        path: uniPaymentFullPath,
      });
    }
    const emailText = `\nDear ${user.university_name},\n\nPlease find below the applicant's essential academic and financial documents.\n\n- Name: ${user.name}\n- Email: ${user.email}\n- Program: ${user.program_name}\n- University: ${user.university_name}\n- Trade: ${user.trade_name}\n- Country: ${user.country_name}\n\nCommission information has been successfully updated in our system.\n- Commission: $ ${commission}\n\nAttached are:\n${attachments.map((att) => `- ${att.filename}`).join('\n')}\n\nRegards,  \nBringUrBuddy Team\n`;
    const mailOptions = {
      from: `"BringUrBuddy" <${process.env.EMAIL_USER}>`,
      to: email,
      cc: cc,
      subject: 'Request for Commission Payment',
      text: emailText,
      attachments,
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Commission updated successfully.', status: 'success' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update commission.', error: error.message, status: 'error' });
  }
});

module.exports = router; 