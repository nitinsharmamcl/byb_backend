const express = require('express');
const router = express.Router();
const db = require('../../config/db');


router.post('/', async (req, res) => {
  const { programId } = req.body;
  if (!programId) {
    return res.status(400).json({ error: 'Program ID is required' });
  }
  try {
    const [universities] = await db.query('SELECT * FROM universities WHERE program_id = ?', [programId]);
    return res.status(200).json({ universities });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/', async (req, res) => {
  try {
    const [universities] = await db.query('SELECT * FROM universities');
    return res.status(200).json({ universities });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router; 