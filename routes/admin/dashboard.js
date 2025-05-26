const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [totalUsersResult] = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = totalUsersResult[0].count;
    const [totalApplicationsResult] = await db.query('SELECT COUNT(*) as count FROM users');
    const totalApplications = totalApplicationsResult[0].count;
    const [pendingVerificationsResult] = await db.query('SELECT COUNT(*) as count FROM users WHERE document_verified_status = 0');
    const pendingVerifications = pendingVerificationsResult[0].count;
    const [totalPaymentsResult] = await db.query('SELECT COUNT(*) as count FROM users WHERE payment_status = 1');
    const totalPayments = totalPaymentsResult[0].count;
    const [recentUsers] = await db.query(`SELECT u.id, u.name, u.email, u.created_at as createdAt, p.name as programName, u.status FROM users u LEFT JOIN programs p ON u.program_id = p.id ORDER BY u.created_at DESC LIMIT 5`);
    const [submittedApplicationsResult] = await db.query('SELECT COUNT(*) as count FROM users WHERE application_submitted = 1');
    const submittedApplications = submittedApplicationsResult[0].count;
    const [documentsVerifiedResult] = await db.query('SELECT COUNT(*) as count FROM users WHERE document_verified_status = 1');
    const documentsVerified = documentsVerifiedResult[0].count;
    const [offerLettersIssuedResult] = await db.query('SELECT COUNT(*) as count FROM users WHERE offer_letter_status = 1');
    const offerLettersIssued = offerLettersIssuedResult[0].count;
    const [paymentsCompletedResult] = await db.query('SELECT COUNT(*) as count FROM users WHERE payment_status = 1');
    const paymentsCompleted = paymentsCompletedResult[0].count;
    const formattedRecentUsers = recentUsers.map(user => ({ id: user.id, name: user.name, email: user.email, program: user.programName || 'Not Assigned', registeredOn: user.createdAt, status: user.status }));
    res.json({
      stats: { totalUsers, totalApplications, pendingVerifications, totalPayments },
      recentUsers: formattedRecentUsers,
      applicationStatus: { totalApplications, submittedApplications, documentsVerified, offerLettersIssued, paymentsCompleted },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router; 