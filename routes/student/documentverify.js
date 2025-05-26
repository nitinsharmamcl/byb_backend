const express = require('express');
const db = require('../../config/db');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id } = req.body;
    const [result] = await db.query('UPDATE users SET document_verified_status = 1 WHERE id = ?', [id]);
    return res.json({ result: result, message: 'User fetched Successfully' });
  } catch (err) {
    return res.json({ err: err.message, message: 'Error while updating user status' });
  }
});

module.exports = router; 