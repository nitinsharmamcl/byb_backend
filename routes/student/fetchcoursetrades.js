const express = require('express');
const db = require('../../config/db');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Program ID is required' });
    }
    const [trades] = await db.query('SELECT * FROM course_trades WHERE program_id = ?', [id]);
    if (!trades || trades.length === 0) {
      return res.status(404).json({ message: 'No trades found for this program' });
    }
    return res.status(200).json({ trades });
  } catch (error) {
    console.error('Error fetching course trades:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 