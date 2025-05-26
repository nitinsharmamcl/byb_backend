const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [result] = await db.query('SELECT COUNT(*) AS submittedApplicationsCount FROM users WHERE application_submitted = 1');
    const submittedApplicationsCount = result[0].submittedApplicationsCount;
    res.status(200).json({ submittedApplicationsCount, message: 'Submitted applications count fetched successfully' });
  } catch (error) {
    console.error('Error fetching submitted applications count:', error);
    res.status(500).json({ error: 'Failed to fetch submitted applications count' });
  }
});

module.exports = router; 