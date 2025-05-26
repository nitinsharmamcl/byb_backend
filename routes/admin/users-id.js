const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!user || (Array.isArray(user) && user.length === 0)) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User fetched successfully', user: user[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT update user by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, country, status, program_id } = req.body;
    const [existingUser] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!existingUser || (Array.isArray(existingUser) && existingUser.length === 0)) {
      return res.status(404).json({ error: 'User not found' });
    }
    await db.query('UPDATE users SET name = ?, email = ?, phone = ?, country = ?, status = ?, program_id = ? WHERE id = ?', [name, email, phone, country, status, program_id, id]);
    res.status(200).json({ message: 'User updated successfully', user: { id, name, email, phone, country, status, program_id } });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existingUser] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!existingUser || (Array.isArray(existingUser) && existingUser.length === 0)) {
      return res.status(404).json({ error: 'User not found' });
    }
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router; 