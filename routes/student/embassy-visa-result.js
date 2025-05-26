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
    cb(null, Date.now() + '-visa_document-' + file.originalname);
  },
});
const upload = multer({ storage });

router.post('/', upload.single('visa_document'), async (req, res) => {
  try {
    const { email } = req.body;
    const visa_document = req.file ? `/embassy/visa-result/${req.file.filename}` : null;
    const [users] = await db.query('SELECT id, name, email FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];
    await db.query('UPDATE visa SET visa_document = ? WHERE user_id = ?', [visa_document, user.id]);
    await db.query('UPDATE users SET visa = ? WHERE id = ?', [visa_document, user.id]);
    return res.json({ message: 'success' });
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 