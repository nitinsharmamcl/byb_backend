const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    // Fetch offer letter path from DB
    const [rows] = await db.query(
      'SELECT offer_letter FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length) {
      return res.status(200).json({ offerLetters: [] });
    }
    const filePath = rows[0].offer_letter;
    // Ensure file exists
    const fullFilePath = path.join(__dirname, '../../uploads', filePath);
    if (!fs.existsSync(fullFilePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    // Return file URL (relative to /uploads)
    return res.status(200).json({
      offerLetters: [{ name: path.basename(filePath), url: `/uploads/${filePath}` }],
    });
  } catch (error) {
    console.error('Error fetching offer letter:', error);
    return res.status(500).json({ error: 'Failed to fetch offer letter', offerLetters: [] });
  }
});

module.exports = router; 