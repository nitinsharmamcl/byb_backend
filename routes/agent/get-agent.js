const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    const [agents] = await db.query('SELECT * FROM agents WHERE email = ?', [email]);
    res.status(200).json({
      agents: agents[0],
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