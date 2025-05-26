const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../../config/db');

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'public', 'embassy', 'embassy-result');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-result_document-' + file.originalname);
  },
});
const upload = multer({ storage });

router.post('/', upload.single('result_document'), async (req, res) => {
  try {
    const { email } = req.body;
    const result_document = req.file ? `/embassy/embassy-result/${req.file.filename}` : null;
    const [users] = await db.query('SELECT id, name, email FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];
    const [prev] = await db.query('select * from embassy where user_id = ?', [user.id]);
    if (prev[0]?.user_id === user.id) {
      await db.query('UPDATE embassy SET result_document = ? WHERE user_id = ?', [result_document, user.id]);
    } else {
      await db.query('INSERT INTO embassy (user_id, result_document) values(?, ?);', [user.id, result_document]);
    }
    return res.json({ message: 'success' });
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 