const express = require('express');
const router = express.Router();
const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    // Fetch student data using email
    const [rows] = await db.query(
      'SELECT name, id, id_proof, phone_number FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const { id, name, id_proof, phone_number } = rows[0];
    // Generate Offer Letter PDF
    const doc = new jsPDF();
    doc.text('Offer Letter', 20, 20);
    doc.text(`Dear ${name},`, 20, 40);
    doc.text(
      `We are pleased to offer you admission with ${id_proof} as ID proof.`,
      20,
      50
    );
    doc.text(`Your phone number is: ${phone_number}`, 20, 60);
    doc.text('Best Regards,', 20, 80);
    doc.text('[Your Institution Name]', 20, 90);
    // Ensure upload directory exists
    const uploadPath = path.join(process.cwd(), 'public', 'offerletters');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    // Save PDF file
    const pdfFilename = `${id}_Offer_Letter.pdf`;
    const pdfPath = path.join(uploadPath, pdfFilename);
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync(pdfPath, pdfBuffer);
    const savedpath = `/offerletters/${pdfFilename}`;
    // Store offer letter filename in the database
    await db.query('UPDATE users SET offer_letter = ? WHERE id = ?', [
      savedpath,
      id,
    ]);
    // Send Email with Offer Letter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: 'mailto:bringmybuddy@gmail.com',
      to: email,
      subject: 'Your Offer Letter',
      text: `Dear ${name},\n\nPlease find attached your offer letter.\n\nBest Regards,\n[Your Institution Name]`,
      attachments: [
        {
          filename: pdfFilename,
          path: pdfPath,
        },
      ],
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      message: 'Offer letter generated, saved, and sent successfully.',
      offer_letter: pdfFilename,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Failed to generate, store, and send offer letter',
    });
  }
});

module.exports = router; 