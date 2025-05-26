const express = require('express');
const db = require('../../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id, subjects, percentage } = req.body;
    if (!id || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: 'Invalid data format. ID and subjects array are required.' });
    }
    await db.query('START TRANSACTION');
    try {
      for (const item of subjects) {
        if (!item.subject || !item.marks || !item.grade) {
          continue;
        }
        await db.query(
          'INSERT INTO tenth_marks (id, subject, marks, grade, percentage) VALUES (?, ?, ?, ?, ?)',
          [id, item.subject, item.marks, item.grade, percentage]
        );
      }
      await db.query('COMMIT');
      return res.status(200).json({
        message: '10th marks data saved successfully',
        success: true
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error saving 10th marks:', error);
    return res.status(500).json({
      message: 'Failed to save 10th marks data',
      error: error.message,
      success: false
    });
  }
});

module.exports = router; 