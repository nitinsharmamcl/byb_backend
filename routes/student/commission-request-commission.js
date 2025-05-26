const express = require('express');
const router = express.Router();
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
  const { commission, email } = req.body;
  try {
    const emailText = `\n        Dear Admin,\n\n        Please find below the applicant's essential academic and financial documents.\n\n        Commission information has been successfully updated in our system.\n        - Commission: Rs. ${commission}\n\n        Regards,  \n        BringUrBuddy Team\n        `;
    const mailOptions = {
      from: `"BringUrBuddy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Request for Commission Payment',
      text: emailText,
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Commission updated successfully.', status: 'success' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update commission.', error: error.message, status: 'error' });
  }
});

module.exports = router; 