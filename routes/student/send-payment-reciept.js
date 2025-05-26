const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const db = require('../../config/db');

const router = express.Router();

const PaymentReceiptTemplate = require('./paymentReceiptTemplate');

const uploadDir = path.join(process.cwd(), 'public', 'documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function generatePDF(fileName, htmlContent) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const filePath = path.join(uploadDir, fileName);
    await page.pdf({ path: filePath, format: 'A4' });
    return filePath;
  } finally {
    if (browser) await browser.close();
  }
}

router.post('/', async (req, res) => {
  try {
    const { email, name, paymentConfirmation, amount } = req.body;
    if (!email || !name || !paymentConfirmation || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const [users] = await db.query(
      `SELECT u.id, u.university_id, u.program_id, un.name AS university_name, p.name AS program_name 
       FROM users u 
       JOIN universities un ON u.university_id = un.id 
       JOIN programs p ON u.program_id = p.id 
       WHERE u.email = ? 
       LIMIT 1`,
      [email]
    );
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { id } = users[0];
    const pdfFiles = [
      {
        column: 'payment_receipt',
        name: `${id}_Payment_Receipt.pdf`,
        content: PaymentReceiptTemplate(name, amount, paymentConfirmation),
      }
    ];
    const generatedPaths = await Promise.all(
      pdfFiles.map((file) => generatePDF(file.name, file.content))
    );
    const updateQuery = `
      UPDATE users 
      SET  payment_receipt = ?
      WHERE id = ?`;
    await db.query(updateQuery, [
      `/documents/${pdfFiles[0].name}`,
      id,
    ]);
    const mailOptions = {
      from: `"BringUrBuddy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Bring Ur Buddy - Your Documents',
      text: `Hello ${name},\n\nPlease find attached your Admission Letter, Bonafide Letter, Visa, and Payment Receipt.\n\nBest regards,\nBring Ur Buddy Team`,
      attachments: generatedPaths.map((filePath, index) => ({
        filename: pdfFiles[index].name,
        path: filePath,
      })),
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Documents generated, stored, and emailed successfully' });
  } catch (error) {
    console.error('Error processing documents:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 