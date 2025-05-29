const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const db = require('../../config/db');

const PaymentReceiptTemplate = require('./PaymentReceiptTemplate');
const router = express.Router();

const uploadDir = path.join(process.cwd(), 'public', 'documents', 'payments');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'payment_' + req.body.user_id + '_' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post('/', upload.single('payment_document'), async (req, res) => {
  try {
    const { user_id, payment_type } = req.body;
    const paymentFile = req.file;
    if (!user_id || !payment_type || !paymentFile) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const userId = parseInt(user_id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }
    const [usersResult] = await db.query(
      `SELECT u.email, u.name, u.university_id, u.program_id, un.name AS university_name, p.name AS program_name \
       FROM users u \
       JOIN universities un ON u.university_id = un.id \
       JOIN programs p ON u.program_id = p.id \
       WHERE u.id = ? \
       LIMIT 1`,
      [userId]
    );
    if (!usersResult || usersResult.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const user = usersResult[0];
    const fileName = paymentFile.filename;
    const filePath = path.join(uploadDir, fileName);
    const dbFilePath = `/documents/payments/${fileName}`;
    // Generate receipt PDF
    const receiptFileName = `receipt_${userId}_${Date.now()}.pdf`;
    const receiptContent = PaymentReceiptTemplate(
      user.name,
      payment_type === 'yearly' ? 'Yearly Payment' : 'Semester Payment',
      'success'
    );
    const receiptPath = await generatePDF(receiptFileName, receiptContent);
    const dbReceiptPath = `/documents/payments/${receiptFileName}`;
    const insertQuery = `INSERT INTO uni_payments (user_id, payment_document, payment_status, payment_type) VALUES (?, ?, ?, ?)`;
    await db.query(insertQuery, [userId, dbReceiptPath, 1, payment_type]);
    // Send email notification
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: `"BringUrBuddy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `University ${payment_type === 'yearly' ? 'Yearly' : 'Semester'} Payment Receipt`,
      text: `Hello ${user.name},\n\nYour ${payment_type} payment has been received and processed successfully. Please find attached your payment receipt.\n\nBest regards,\nBring Ur Buddy Team`,
      attachments: [
        {
          filename: receiptFileName,
          path: receiptPath,
        },
        {
          filename: fileName,
          path: filePath,
        }
      ],
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      message: 'Payment file uploaded and processed successfully',
      file_path: dbFilePath,
      receipt_path: dbReceiptPath
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({ success: false, error: 'Failed to process payment' });
  }
});

async function generatePDF(fileName, htmlContent) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const filePath = path.join(uploadDir, fileName);
    await page.pdf({ path: filePath, format: 'A4' });
    return filePath;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('PDF Generation Failed');
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = router; 
