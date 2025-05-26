const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// PUT: Update admin by id
router.put('/:id', async (req, res) => {
  try {
    const adminId = req.params.id;
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    await db.query(
      'UPDATE admin SET name = ?, email = ?, password = ? WHERE id = ?',
      [name, email, password, adminId]
    );
    res.status(200).json({ message: 'Admin updated successfully', admin: { id: adminId, name, email } });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ error: 'Failed to update admin' });
  }
});

module.exports = router; 