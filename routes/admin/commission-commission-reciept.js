const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.toLowerCase().endsWith('.pdf')) {
      return cb(new Error('payment_receipt must be a PDF'));
    }
    cb(null, true);
  }
});

router.post('/', upload.single('payment_receipt'), async (req, res) => {
  try {
    const { user_id } = req.body;
    const filePath = req.file ? `/uploads/documents/${req.file.filename}` : null;
    if (!user_id || !filePath) {
      return res.status(400).json({ error: 'user_id and payment_receipt PDF are required' });
    }
    await db.query('UPDATE commission SET payment_reciept = ? WHERE user_id = ?', [filePath, user_id]);
    res.status(201).json({ message: 'success' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 