const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET all universities
router.get('/', async (req, res) => {
  try {
    const [universities] = await db.query('SELECT * FROM universities');
    res.status(200).json({
      message: 'Universities fetched successfully',
      universities,
    });
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ error: 'Failed to fetch universities' });
  }
});

// POST add a university
router.post('/', async (req, res) => {
  try {
    const {
      name,
      program_id,
      university_country_id,
      location,
      campus,
      fees,
      annual_fees,
      description,
      entry_type,
      uni_image
    } = req.body;
    const validatedEntryType = entry_type !== undefined ? Number(entry_type) : 0;
    if (![0, 1].includes(validatedEntryType)) {
      return res.status(400).json({ error: 'Invalid entry_type. Must be 0 (manual) or 1 (automated)' });
    }
    await db.query(
      `INSERT INTO universities 
      (name, program_id, university_country_id, location, campus, fees, annual_fees, description, entry_type, uni_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        program_id,
        university_country_id,
        location,
        campus,
        fees,
        annual_fees,
        description,
        validatedEntryType,
        uni_image
      ]
    );
    res.status(200).json({
      message: 'University added successfully',
      university: { name, program_id, entry_type: validatedEntryType, uni_image },
    });
  } catch (error) {
    console.error('Error adding university:', error);
    res.status(500).json({ error: 'Failed to add university' });
  }
});

// PUT update a university
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      program_id,
      university_country_id,
      location,
      campus,
      fees,
      annual_fees,
      description,
      entry_type,
      uni_image
    } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'University ID is required' });
    }
    const validatedEntryType = entry_type !== undefined ? Number(entry_type) : 0;
    if (![0, 1].includes(validatedEntryType)) {
      return res.status(400).json({ error: 'Invalid entry_type. Must be 0 (manual) or 1 (automated)' });
    }
    const [existingUniversity] = await db.query('SELECT * FROM universities WHERE id = ?', [id]);
    if (!existingUniversity || (Array.isArray(existingUniversity) && existingUniversity.length === 0)) {
      return res.status(404).json({ error: 'University not found' });
    }
    await db.query(
      `UPDATE universities 
      SET name = ?, program_id = ?, university_country_id = ?, 
          location = ?, campus = ?, fees = ?, annual_fees = ?, 
          description = ?, entry_type = ?, uni_image = ?
      WHERE id = ?`,
      [
        name,
        program_id,
        university_country_id,
        location,
        campus,
        fees,
        annual_fees,
        description,
        validatedEntryType,
        uni_image,
        id
      ]
    );
    res.status(200).json({
      message: 'University updated successfully',
      university: { id, name, program_id, entry_type: validatedEntryType, uni_image },
    });
  } catch (error) {
    console.error('Error updating university:', error);
    res.status(500).json({ error: 'Failed to update university' });
  }
});

module.exports = router; 