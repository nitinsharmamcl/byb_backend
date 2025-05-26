const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../../config/db');
const router = express.Router();

const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.random().toString(36).substring(2, 9) + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});
const upload = multer({ storage });

router.post('/', upload.fields([
  { name: 'profile_img' },
  { name: 'tenth_certificate' },
  { name: 'twelfth_certificate' },
  { name: 'bachelor_certificate' }
]), async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;
    const id = formData.id;
    const name = formData.name;
    const email = formData.email;
    const phone_number = formData.phone_number;
    const program_id = formData.program_id;
    const university_id = formData.university_id;
    const [fetchuser] = await db.query('select * from users where id = ?', [id]);
    const user = fetchuser[0];
    const profile_img = files['profile_img'] ? '/uploads/' + files['profile_img'][0].filename : user.profile_img;
    const tenth_certificate = files['tenth_certificate'] ? '/uploads/' + files['tenth_certificate'][0].filename : user.tenth_certificate;
    const twelfth_certificate = files['twelfth_certificate'] ? '/uploads/' + files['twelfth_certificate'][0].filename : user.twelfth_certificate;
    const bachelor_certificate = files['bachelor_certificate'] ? '/uploads/' + files['bachelor_certificate'][0].filename : user.bachelor_certificate;
    const updatedName = name || user.name;
    const updatedEmail = email || user.email;
    const updatedPhone_number = phone_number || user.phone_number;
    const updatedProgram_id = program_id || user.program_id;
    const updatedUnivrsity_id = university_id || user.university_id;
    await db.query(
      'UPDATE users SET name=?, email=?, phone_number=?,profile_img=?, program_id=?, university_id=?, tenth_certificate=?, twelfth_certificate=?,bachelor_certificate=? WHERE id=?',
      [
        updatedName,
        updatedEmail,
        updatedPhone_number,
        profile_img,
        updatedProgram_id,
        updatedUnivrsity_id,
        tenth_certificate,
        twelfth_certificate,
        bachelor_certificate,
        id,
      ]
    );
    return res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router; 