const express = require('express');
const db = require('../../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id, degree, marks, grade, percentage } = req.body;
    await db.query('START TRANSACTION');
    try {
      await db.query(
        'INSERT INTO bachelor_marks (id, degree, marks, grade, percentage) VALUES (?, ?, ?, ?, ?)',
        [id, degree, marks, grade, percentage]
      );
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