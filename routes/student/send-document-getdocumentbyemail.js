const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const [rows] = await db.query(
      'SELECT admission_letter,offer_letter, bonafide_letter, visa, payment_receipt, ugc_letter, affiliation_letter FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Documents not found!' });
    }
    const documentPaths = {
      admission_letter: rows[0].admission_letter,
      offer_letter: rows[0].offer_letter,
      bonafide_letter: rows[0].bonafide_letter,
      visa: rows[0].visa,
      payment_receipt: rows[0].payment_receipt,
      ugc_letter: rows[0].ugc_letter,
      affiliation_letter: rows[0].affiliation_letter,
    };
    const documents = Object.entries(documentPaths)
      .filter(([_, filePath]) => filePath)
      .map(([key, filePath]) => {
        const fullPath = path.join(__dirname, '../../uploads', filePath);
        if (fs.existsSync(fullPath)) {
          return { name: key, url: `/uploads/${filePath.replace(/\\/g, '/')}` };
        }
        return null;
      })
      .filter(Boolean);
    return res.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

module.exports = router; 