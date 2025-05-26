const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../../config/db');


const router = express.Router();

const uploadDir = path.join(process.cwd(), 'public', 'embassy', 'visa-result');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-visa_decision_letter-' + file.originalname);
  },
});
const upload = multer({ storage });

router.post('/', upload.single('visa_result_document'), async (req, res) => {
  try {
    const { email } = req.body;
    const visa_decision_letter = req.file ? `/embassy/visa-result/${req.file.filename}` : null;
    const [users] = await db.query('SELECT id, name, email FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];
    const [prev] = await db.query('select * from visa where user_id = ?', [user.id]);
    if (prev[0]?.user_id === user.id) {
      await db.query('UPDATE visa SET visa_decision_letter = ? WHERE user_id = ?', [visa_decision_letter, user.id]);
    } else {
      await db.query('INSERT INTO visa (visa_decision_letter, user_id) VALUES (?, ?);', [visa_decision_letter, user.id]);
    }
    return res.json({ message: 'success' });
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 