const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { agent_id } = req.body;
    const [students] = await db.query('SELECT * FROM users WHERE agent_id = ?', [agent_id]);
    res.status(200).json({
      students: students,
      message: 'students fetched successfully',
    });
  } catch (err) {
    res.status(500).json({
      err: err,
      message: 'Error while fetching students',
    });
  }
});

module.exports = router; 