const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET users with pagination, search, and status filter
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*) as total FROM users';
    let usersQuery = `
      SELECT u.id, u.name, u.email, u.phone, u.country, u.status, 
             u.created_at as registeredOn, p.name as program
      FROM users u
      LEFT JOIN programs p ON u.program_id = p.id
    `;
    const queryParams = [];
    const whereConditions = [];

    if (search) {
      whereConditions.push('(u.name LIKE ? OR u.email LIKE ? OR p.name LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    if (status && status !== 'all') {
      whereConditions.push('u.status = ?');
      queryParams.push(status);
    }
    if (whereConditions.length > 0) {
      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
      countQuery += ` ${whereClause}`;
      usersQuery += ` ${whereClause}`;
    }
    usersQuery += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [countResult] = await db.query(countQuery, queryParams.slice(0, queryParams.length - 2));
    const totalUsers = countResult[0].total;
    const [users] = await db.query(usersQuery, queryParams);
    const totalPages = Math.ceil(totalUsers / limit);
    res.json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching users data:', error);
    res.status(500).json({ error: 'Failed to fetch users data' });
  }
});

// POST create a new user
router.post('/', async (req, res) => {
  try {
    const userData = req.body;
    if (!userData.name || !userData.email) {
      return res.status(400).json({ error: 'Name and email are required fields' });
    }
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [userData.email]);
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const [result] = await db.query(
      `INSERT INTO users (name, email, phone, country, status, program_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userData.name,
        userData.email,
        userData.phone || null,
        userData.country || null,
        userData.status || 'pending',
        userData.programId || null,
      ]
    );
    if (result.affectedRows === 1) {
      const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      return res.json({ success: true, user: newUser[0] });
    } else {
      return res.status(500).json({ error: 'Failed to create user' });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

module.exports = router; 