const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');
const multer = require('multer');
const db = require('../../config/db');

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.random().toString(36).substring(2, 9) + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});
const upload = multer({ storage });

router.post('/', upload.fields([
  { name: 'ticket_document', maxCount: 1 },
  { name: 'user_photo', maxCount: 1 }
]), async (req, res) => {
  try {
    const { user_id, university_email, cc_email, departure_datetime, departure_port, destination_port, destination_datetime } = req.body;
    const ticket_document = req.files['ticket_document'] ? req.files['ticket_document'][0] : null;
    const user_photo = req.files['user_photo'] ? req.files['user_photo'][0] : null;
    if (!user_id || !departure_datetime || !departure_port || !destination_port || !destination_datetime || !ticket_document) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const ticketPath = `/uploads/${ticket_document.filename}`;
    const userPhoto = user_photo ? `/uploads/${user_photo.filename}` : null;
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.tenth_certificate, u.twelfth_certificate, u.payment_receipt, u.id_proof, u.offer_letter, u.bonafide_letter, u.admission_letter, u.ugc_letter, u.visa, u.affiliation_letter, u.university_id, p.name AS program_name, un.name AS university_name, ct.name AS trade_name, c.name AS country_name FROM users u LEFT JOIN programs p ON u.program_id = p.id LEFT JOIN universities un ON u.university_id = un.id LEFT JOIN course_trades ct ON u.course_trade_id = ct.id LEFT JOIN countries c ON u.country_id = c.id WHERE u.id = ?`,
      [user_id]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = rows[0];
    const [existingTravelRows] = await db.query('SELECT id FROM tickets WHERE user_id = ?', [user_id]);
    if (Array.isArray(existingTravelRows) && existingTravelRows.length > 0) {
      await db.query('UPDATE tickets SET departure_datetime = ?, departure_port = ?, destination_port = ?, destination_datetime = ?, ticket_document = ?, user_photo = ? WHERE user_id = ?', [departure_datetime, departure_port, destination_port, destination_datetime, ticketPath, userPhoto, user_id]);
    } else {
      await db.query('INSERT INTO tickets (user_id, departure_datetime, departure_port, destination_port, destination_datetime, ticket_document, user_photo) VALUES (?, ?, ?, ?, ?, ?, ?)', [user_id, departure_datetime, departure_port, destination_port, destination_datetime, ticketPath, userPhoto]);
    }
    const attachments = [];
    if (ticketPath) {
      attachments.push({
        filename: `ticket_document.${ticketPath.split('.').pop()}`,
        path: path.join(process.cwd(), 'public', ticketPath.replace(/^\/+/g, '')),
      });
    }
    if (userPhoto) {
      attachments.push({
        filename: `user_photo.${userPhoto.split('.').pop()}`,
        path: path.join(process.cwd(), 'public', userPhoto.replace(/^\/+/g, '')),
      });
    }
    const emailText = `
Dear ${user.university_name},

Please find below the applicant's travel details and ticket document.

- Name: ${user.name}
- Email: ${user.email}
- Program: ${user.program_name}
- University: ${user.university_name}
- Trade: ${user.trade_name}
- Country: ${user.country_name}

Travel Details:
- Departure DateTime: ${departure_datetime}
- Departure Port: ${departure_port}
- Destination Port: ${destination_port}
- Destination DateTime: ${destination_datetime}

Attached is the ticket document along with other documents.
${attachments.map((att) => `- ${att.filename}`).join('\n')}

Regards,  \nBringUrBuddy Team
`;
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
      subject: 'Applicant Travel Details and Ticket Document',
      text: emailText,
      attachments,
    };
    await transporter.sendMail(mailOptions);
    return res.json({
      message: `Email sent to university at ${university_email}`,
      success: true,
    });
  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router; 