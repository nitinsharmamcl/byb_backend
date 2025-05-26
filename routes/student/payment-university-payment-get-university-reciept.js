const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { user_id } = req.body;
    const [rows] = await db.query('SELECT payment_document FROM uni_payments WHERE user_id = ?', [user_id]);
    const filePath = rows[0]?.payment_document;
    const fullFilePath = path.join(process.cwd(), 'public', filePath);
    if (!fs.existsSync(fullFilePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    return res.json({
      payment_document: [{ name: path.basename(filePath), url: `${filePath}` }],
    });
  } catch (error) {
    console.error('Error fetching offer letter:', error);
    return res.status(500).json({ error: 'Failed to fetch offer letter', payment_document: [] });
  }
});

module.exports = router; 