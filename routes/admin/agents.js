const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [agents] = await db.query('SELECT * FROM agents');
    res.status(200).json({
      agents: agents,
      message: 'agents fetched successfully',
    });
  } catch (err) {
    res.status(500).json({
      err: err,
      message: 'Error while fetching agents',
    });
  }
});

module.exports = router; 