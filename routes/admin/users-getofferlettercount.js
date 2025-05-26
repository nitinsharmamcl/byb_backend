const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [result] = await db.query('SELECT COUNT(*) AS offerLetterCount FROM users WHERE offer_letter_status = 1');
    const offerLetterCount = result[0].offerLetterCount;
    res.status(200).json({ offerLetterCount, message: 'Offer letter count fetched successfully' });
  } catch (error) {
    console.error('Error fetching offer letter count:', error);
    res.status(500).json({ error: 'Failed to fetch offer letter count' });
  }
});

module.exports = router; 