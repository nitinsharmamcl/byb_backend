const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { id, name, email, phone_number, address, country_id, country_code } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Agent ID is required' });
    }
    let updateFields = [];
    let updateValues = [];
    if (name) { updateFields.push('name = ?'); updateValues.push(name); }
    if (email) { updateFields.push('email = ?'); updateValues.push(email); }
    if (phone_number) { updateFields.push('phone_number = ?'); updateValues.push(phone_number); }
    if (address) { updateFields.push('address = ?'); updateValues.push(address); }
    if (country_id) { updateFields.push('country_id = ?'); updateValues.push(country_id); }
    if (country_code) { updateFields.push('country_code = ?'); updateValues.push(country_code); }
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided for update' });
    }
    updateValues.push(id);
    const updateQuery = `UPDATE agents SET ${updateFields.join(', ')} WHERE id = ?`;
    const [result] = await db.query(updateQuery, updateValues);
    if (result && result.affectedRows > 0) {
      const [updatedAgents] = await db.query('SELECT * FROM agents WHERE id = ?', [id]);
      if (Array.isArray(updatedAgents) && updatedAgents.length > 0) {
        const updatedAgent = updatedAgents[0];
        delete updatedAgent.password;
        delete updatedAgent.otp;
        return res.status(200).json({ success: true, message: 'Agent details updated successfully', agent: updatedAgent });
      }
    }
    res.status(400).json({ success: false, message: 'Failed to update agent details' });
  } catch (error) {
    console.error('Error updating agent details:', error);
    res.status(500).json({ success: false, message: 'An error occurred while updating agent details', error: error.message });
  }
});

module.exports = router; 