const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const db = require('../../config/db');

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'public/uploads');
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

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

router.post('/', upload.fields([
  { name: 'tenth_certificate' },
  { name: 'twelfth_certificate' },
  { name: 'bachelor_certificate' },
  { name: 'id_proof' },
  { name: 'profile_img' },
  { name: 'other_certificate[]' }
]), async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;
    const name = formData.name;
    const email = formData.email;
    const password = formData.password;
    const phone_number = formData.phone_number;
    const country_id = Number(formData.country_id);
    const university_country = formData.university_country;
    const tenth_marks_id = formData.tenth_marks_id;
    const twelfth_marks_id = formData.twelfth_marks_id;
    const bachelor_marks_id = formData.bachelor_marks_id;
    const program_id = Number(formData.program_id);
    const university_id = Number(formData.university_id);
    const course_type_id = Number(formData.course_type_id);
    const course_trade_id = Number(formData.course_trade_id);
    const agent_id = Number(formData.agent_id);

    const filePaths = {};
    if (files['tenth_certificate']) filePaths.tenth_certificate = '/uploads/' + files['tenth_certificate'][0].filename;
    if (files['twelfth_certificate']) filePaths.twelfth_certificate = '/uploads/' + files['twelfth_certificate'][0].filename;
    if (files['bachelor_certificate']) filePaths.bachelor_certificate = '/uploads/' + files['bachelor_certificate'][0].filename;
    if (files['id_proof']) filePaths.id_proof = '/uploads/' + files['id_proof'][0].filename;
    if (files['profile_img']) filePaths.profile_img = '/uploads/' + files['profile_img'][0].filename;

    let otherPaths = null;
    if (files['other_certificate[]']) {
      otherPaths = files['other_certificate[]'].map(f => '/uploads/' + f.filename).join(' ');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      `INSERT INTO users (
        name, email, password, phone_number,agent_id, country_id,university_country,
        course_type_id, course_trade_id, program_id, university_id,
        id_proof, otp, otp_expires_at,profile_img,
        tenth_certificate, twelfth_certificate,bachelor_certificate, other_certificate, tenth_marks_id, twelfth_marks_id, bachelor_marks_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?, ?);`,
      [
        name,
        email,
        hashedPassword,
        phone_number,agent_id,
        country_id,
        university_country,
        course_type_id,
        course_trade_id,
        program_id,
        university_id,
        filePaths.id_proof,
        otp,
        otpExpiry,
        filePaths.profile_img,
        filePaths.tenth_certificate,
        filePaths.twelfth_certificate,
        filePaths.bachelor_certificate,
        otherPaths,
        tenth_marks_id,
        twelfth_marks_id,
        bachelor_marks_id
      ]
    );

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Registration',
        html: `<p>Dear <strong>${name}</strong>,</p><p>Your OTP for registration is: <strong>${otp}</strong></p><p>This OTP is valid for 10 minutes.</p><p>Best Regards,<br><strong>BringUrBuddy Team</strong></p>`,
      });
    } catch (emailError) {
      console.error('Email Sending Error:', emailError);
      return res.status(500).json({ error: 'User registered but failed to send OTP email.' });
    }
    return res.status(201).json({ message: 'success' });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 