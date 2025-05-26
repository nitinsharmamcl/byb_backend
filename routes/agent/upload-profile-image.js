const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/agents/profile'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueSuffix);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP files are allowed.'));
    }
    cb(null, true);
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Agent ID is required' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Profile image file is required' });
    }
    const dbFilePath = `/uploads/agents/profile/${req.file.filename}`;
    const [result] = await db.query('UPDATE agents SET profile_img = ? WHERE id = ?', [dbFilePath, id]);
    if (result && result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Profile image uploaded successfully', profileImgPath: dbFilePath });
    }
    res.status(500).json({ success: false, message: 'Failed to update profile image in database' });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ success: false, message: 'An error occurred while uploading profile image', error: error.message });
  }
});

module.exports = router; 