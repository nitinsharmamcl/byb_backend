const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [result] = await db.query('SELECT COUNT(*) AS totalCountriesCount FROM countries');
    const totalCountriesCount = result[0].totalCountriesCount;
    res.status(200).json({ totalCountriesCount, message: 'Total countries count fetched successfully' });
  } catch (error) {
    console.error('Error fetching countries count:', error);
    res.status(500).json({ error: 'Failed to fetch countries count' });
  }
});

module.exports = router; 