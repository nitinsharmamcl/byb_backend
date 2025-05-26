const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET application by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!user || (Array.isArray(user) && user.length === 0)) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.status(200).json({ message: 'Application fetched successfully', application: user[0] });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// PUT update application status by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Application status is required' });
    }
    const validStatuses = ['submitted', 'pending', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid application status' });
    }
    if (status === 'submitted') {
      await db.query('UPDATE users SET application_submitted = 1 WHERE id = ?', [id]);
    } else if (status === 'pending') {
      await db.query('UPDATE users SET application_submitted = 0 WHERE id = ?', [id]);
    } else {
      await db.query('UPDATE users SET application_submitted = 0 WHERE id = ?', [id]);
    }
    res.status(200).json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

module.exports = router; 