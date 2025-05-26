const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const {
      id,
      name,
      email,
      phone_number,
      payment_status,
      application_submitted,
      university_id,
      program_id,
    } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    const [studentResult] = await db.query('SELECT * FROM users WHERE id = ?', [parseInt(id.toString())]);
    if (!studentResult || !Array.isArray(studentResult) || studentResult.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const updateFields = [];
    const values = [];
    if (name !== undefined) { updateFields.push('name = ?'); values.push(name); }
    if (university_id !== undefined) { updateFields.push('university_id = ?'); values.push(university_id); }
    if (program_id !== undefined) { updateFields.push('program_id = ?'); values.push(program_id); }
    if (email !== undefined) { updateFields.push('email = ?'); values.push(email); }
    if (phone_number !== undefined) { updateFields.push('phone_number = ?'); values.push(phone_number); }
    if (payment_status !== undefined) { updateFields.push('payment_status = ?'); values.push(parseInt(payment_status.toString())); }
    if (application_submitted !== undefined) { updateFields.push('application_submitted = ?'); values.push(parseInt(application_submitted.toString())); }
    values.push(parseInt(id.toString()));
    if (updateFields.length > 0) {
      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.query(query, values);
      const [updatedResult] = await db.query('SELECT * FROM users WHERE id = ?', [parseInt(id.toString())]);
      if (updatedResult && Array.isArray(updatedResult) && updatedResult.length > 0) {
        return res.status(200).json({ success: true, message: 'Student updated successfully', student: updatedResult[0] });
      }
    }
    res.status(200).json({ success: true, message: 'No changes were made', student: studentResult[0] });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ success: false, error: 'Failed to update student', message: error.message });
  }
});

module.exports = router; 