const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const db = require('../../config/db');


const router = express.Router();

const uploadDir = path.join(process.cwd(), 'public', 'check-list-documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.fieldname + '-' + file.originalname);
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

const fileFields = [
  'offer_letter',
  'admission_letter',
  'bonafide_certificate',
  'student_undertaking_form',
  'offer_letter_school',
  'photograph',
  'parent_affidavit',
  'proof_of_residence',
  'receipt_of_paid_fees',
  'itinerary_ticket',
  'bank_statement',
  'bank_statement_owner_id',
  'passport_copy',
  'educational_certificates',
  'id_copy',
].map((name) => ({ name }));

router.post('/', upload.fields(fileFields), async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;
    const user_id = formData.user_id;
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const uploadedFiles = {};
    for (const field of fileFields.map(f => f.name)) {
      if (files && files[field] && files[field][0]) {
        uploadedFiles[field] = '/check-list-documents/' + files[field][0].filename;
      }
    }
    const [existingDocs] = await db.query('SELECT * FROM documents WHERE user_id = ?', [user_id]);
    const [usertable] = await db.query('SELECT * FROM users WHERE id = ?', [user_id]);
    const email = usertable[0].email;
    let result;
    if (Array.isArray(existingDocs) && existingDocs.length > 0) {
      if (Object.keys(uploadedFiles).length > 0) {
        const updateFields = Object.keys(uploadedFiles)
          .map((key) => `${key} = ?`)
          .join(', ');
        const values = Object.values(uploadedFiles);
        const updateQuery = `UPDATE documents SET ${updateFields}, updated_at = NOW() WHERE user_id = ?`;
        [result] = await db.query(updateQuery, [...values, user_id]);
      }
    } else {
      const insertFields = ['user_id', ...Object.keys(uploadedFiles)];
      const insertValues = [user_id, ...Object.values(uploadedFiles)];
      const placeholders = insertFields.map(() => '?').join(', ');
      const query = `INSERT INTO documents (${insertFields.join(', ')}) VALUES (${placeholders})`;
      [result] = await db.query(query, insertValues);
    }
    const attachments = Object.entries(uploadedFiles).map(([key, relativePath]) => {
      const fullPath = path.join(process.cwd(), 'public', relativePath.replace('/check-list-documents/', 'check-list-documents/'));
      return {
        filename: `${key.replace(/_/g, ' ')}.${fullPath.split('.').pop()}`,
        path: fullPath,
      };
    });
    const mailOptions = {
      from: `"BringUrBuddy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Bring Ur Buddy - Your Documents',
      text: `Hello ${email},\n\nPlease find attached your uploaded documents.\n\nBest regards,\nBring Ur Buddy Team`,
      attachments,
    };
    if (attachments.length > 0) {
      await transporter.sendMail(mailOptions);
    }
    return res.json({
      message: 'Documents uploaded and emailed successfully',
      success: true,
      result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router; 