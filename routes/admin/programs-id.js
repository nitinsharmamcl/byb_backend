const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET program by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [program] = await db.query('SELECT * FROM programs WHERE id = ?', [id]);
    if (!program || (Array.isArray(program) && program.length === 0)) {
      return res.status(404).json({ error: 'Program not found' });
    }
    res.status(200).json({ message: 'Program fetched successfully', program });
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ error: 'Failed to fetch program' });
  }
});

// PUT update program by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, course_id } = req.body;
    if (!name || !course_id) {
      return res.status(400).json({ error: 'Program name and course_id are required.' });
    }
    const [existingProgram] = await db.query('SELECT * FROM programs WHERE id = ?', [id]);
    if (!existingProgram || (Array.isArray(existingProgram) && existingProgram.length === 0)) {
      return res.status(404).json({ error: 'Program not found' });
    }
    await db.query('UPDATE programs SET name = ?, course_id = ? WHERE id = ?', [name, course_id, id]);
    res.status(200).json({ message: 'Program updated successfully', program: { id, name, course_id } });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ error: 'Failed to update program' });
  }
});

// DELETE program by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existingProgram] = await db.query('SELECT * FROM programs WHERE id = ?', [id]);
    if (!existingProgram || (Array.isArray(existingProgram) && existingProgram.length === 0)) {
      return res.status(404).json({ error: 'Program not found' });
    }
    await db.query('DELETE FROM programs WHERE id = ?', [id]);
    res.status(200).json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ error: 'Failed to delete program' });
  }
});

module.exports = router; 