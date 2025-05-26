const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { agent_id } = req.body;
    const [commission] = await db.query('select commission from agents WHERE id = ?', [agent_id]);
    return res.status(200).json({ commission: commission[0] });
  } catch (err) {
    return res.status(400).json({ error: 'Internal Error ' });
  }
});

module.exports = router; 