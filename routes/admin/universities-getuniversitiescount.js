const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [result] = await db.query('SELECT COUNT(*) AS totalUniversitiesCount FROM universities');
    const totalUniversitiesCount = result[0].totalUniversitiesCount;
    res.status(200).json({ totalUniversitiesCount, message: 'Total universities count fetched successfully' });
  } catch (error) {
    console.error('Error fetching total universities count:', error);
    res.status(500).json({ error: 'Failed to fetch total universities count' });
  }
});

module.exports = router; 