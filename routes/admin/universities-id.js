const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET university by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [university] = await db.query('SELECT * FROM universities WHERE id = ?', [id]);
    if (!university || (Array.isArray(university) && university.length === 0)) {
      return res.status(404).json({ error: 'University not found' });
    }
    res.status(200).json({ message: 'University fetched successfully', university: university[0] });
  } catch (error) {
    console.error('Error fetching university:', error);
    res.status(500).json({ error: 'Failed to fetch university' });
  }
});

// PUT update university by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, program_id, university_country_id, location, campus, fees, annual_fees, entry_type, description, uni_image } = req.body;
    const validatedEntryType = entry_type !== undefined ? Number(entry_type) : 0;
    if (![0, 1].includes(validatedEntryType)) {
      return res.status(400).json({ error: 'Invalid entry_type. Must be 0 (manual) or 1 (automated)' });
    }
    const [existingUniversity] = await db.query('SELECT * FROM universities WHERE id = ?', [id]);
    if (!existingUniversity || (Array.isArray(existingUniversity) && existingUniversity.length === 0)) {
      return res.status(404).json({ error: 'University not found' });
    }
    await db.query(
      `UPDATE universities SET name = ?, program_id = ?, university_country_id = ?, location = ?, campus = ?, fees = ?, annual_fees = ?, description = ?, entry_type = ?, uni_image = ? WHERE id = ?`,
      [name, program_id, university_country_id, location, campus, fees, annual_fees, description, validatedEntryType, uni_image, id]
    );
    res.status(200).json({ message: 'University updated successfully', university: { id, name, entry_type: validatedEntryType } });
  } catch (error) {
    console.error('Error updating university:', error);
    res.status(500).json({ error: 'Failed to update university' });
  }
});

// DELETE university by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existingUniversity] = await db.query('SELECT * FROM universities WHERE id = ?', [id]);
    if (!existingUniversity || (Array.isArray(existingUniversity) && existingUniversity.length === 0)) {
      return res.status(404).json({ error: 'University not found' });
    }
    await db.query('DELETE FROM universities WHERE id = ?', [id]);
    res.status(200).json({ message: 'University deleted successfully' });
  } catch (error) {
    console.error('Error deleting university:', error);
    res.status(500).json({ error: 'Failed to delete university' });
  }
});

module.exports = router; 