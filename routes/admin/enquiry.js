const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, coursePreference, message } = req.body;
    await db.query(
      'INSERT INTO enquiry (name,email,phone_number,course_name,message) VALUES (?,?,?,?,?)',
      [name, email, phone, coursePreference, message]
    );
    res.status(200).json({ message: 'Enquiry submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 