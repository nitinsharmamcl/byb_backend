const express = require('express');
const db = require('../../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required', success: false });
    }
    const [documents] = await db.query('SELECT * FROM visa WHERE user_id = ?', [user_id]);
    const documentArray = Array.isArray(documents) ? documents : [];
    return res.json({
      message: documentArray.length > 0 ? 'Documents found' : 'No documents found',
      success: true,
      documents: documentArray.length > 0 ? documentArray : null
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error', error: err.message, success: false });
  }
});

module.exports = router; 