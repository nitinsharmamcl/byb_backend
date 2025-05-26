const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/agents/documents'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'id_proof' && !file.originalname.toLowerCase().endsWith('.pdf')) {
      return cb(new Error('id_proof must be a PDF'));
    }
    cb(null, true);
  }
});

router.post('/', upload.single('id_proof'), async (req, res) => {
  try {
    const { name, email, password, address, phone_number, country_code, country_id } = req.body;
    const id_proof = req.file ? `/uploads/agents/documents/${req.file.filename}` : null;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await db.query(
      `INSERT INTO agents (
        name, email, password, address, country_id, country_code, phone_number, id_proof, otp, otp_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        name,
        email,
        hashedPassword,
        address,
        country_id,
        country_code,
        phone_number,
        id_proof,
        otp,
        otpExpiry,
      ]
    );
    res.status(201).json({ message: 'success' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 