const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [countResult] = await db.query('SELECT COUNT(*) AS submittedApplicationsCount FROM users WHERE application_submitted = 1');
    const submittedApplicationsCount = countResult[0].submittedApplicationsCount;
    const [students] = await db.query('SELECT * FROM users');
    res.status(200).json({
      submittedApplicationsCount,
      students,
      message: 'Submitted applications data fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching submitted applications data:', error);
    res.status(500).json({ error: 'Failed to fetch submitted applications data' });
  }
});

module.exports = router; 