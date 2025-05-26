const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { email, requested_documents } = req.body;
    if (!email || !requested_documents) {
      return res.status(400).json({ error: 'Email and requested_documents are required' });
    }
    await db.query('UPDATE users SET requested_documents = ? WHERE email = ?', [requested_documents, email]);
    res.status(200).json({ success: true, message: 'Requested documents updated successfully' });
  } catch (error) {
    console.error('Error updating requested documents:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 