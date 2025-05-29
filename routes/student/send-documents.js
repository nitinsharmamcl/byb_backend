const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const db = require('../../config/db');
const router = express.Router();


const AdmissionLetterTemplate = require('./AdmissionLetterTemplate');
const UgcNotificationTemplate = require('./UgcNotificationTemplate');
const AffiliationLetterTemplate = require('./AffiliationLetterTemplate');
const BonafideLetterTemplate = require('./BonafideLetterTemplate');
const VisaTemplate = require('./VisaTemplate');
const PaymentReceiptTemplate = require('./PaymentReceiptTemplate');


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
    const { id, university_name, program_name } = users[0];
    const pdfFiles = [
      {
        column: 'admission_letter',
        name: `${id}_Admission_Letter.pdf`,
        content: AdmissionLetterTemplate(name, program_name, university_name),
      },
      {
        column: 'bonafide_letter',
        name: `${id}_Bonafide_Letter.pdf`,
        content: BonafideLetterTemplate(name, university_name),
      },
      {
        column: 'visa',
        name: `${id}_Visa.pdf`,
        content: VisaTemplate(name, 'A1234567'),
      },
      {
        column: 'payment_receipt',
        name: `${id}_Payment_Receipt.pdf`,
        content: PaymentReceiptTemplate(name, amount, paymentConfirmation),
      },
      {
        column: 'ugc_letter',
        name: `${id}_ugc_letter.pdf`,
        content: UgcNotificationTemplate(name, university_name, '11-12-2025'),
      },
      {
        column: 'affiliation_letter',
        name: `${id}_affiliation_letter.pdf`,
        content: AffiliationLetterTemplate(university_name, university_name, '11-12-2025', 'Affiliation Request'),
      },
    ];
    const generatedPaths = await Promise.all(
      pdfFiles.map((file) => generatePDF(file.name, file.content))
    );
    const updateQuery = `
      UPDATE users 
      SET admission_letter = ?, bonafide_letter = ?, visa = ?, payment_receipt = ?, ugc_letter = ?, affiliation_letter = ?
      WHERE id = ?`;
    await db.query(updateQuery, [
      `/documents/${pdfFiles[0].name}`,
      `/documents/${pdfFiles[1].name}`,
      `/documents/${pdfFiles[2].name}`,
      `/documents/${pdfFiles[3].name}`,
      `/documents/${pdfFiles[4].name}`,
      `/documents/${pdfFiles[5].name}`,
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
