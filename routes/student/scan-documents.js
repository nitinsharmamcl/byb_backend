const express = require('express');
const fs = require('fs');
const fetch = require('node-fetch');
const db = require('../../config/db');
const router = express.Router();

async function processFile(filePath) {
  try {
    const base64File = fs.readFileSync(filePath, { encoding: 'base64' });
    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        apikey: process.env.OCR_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        base64image: `data:application/pdf;base64,${base64File}`,
        isOverlayRequired: 'true',
        language: 'eng',
      }),
    });
    const result = await ocrResponse.json();
    if (!result || !result.ParsedResults) {
      return { status: 405, error: 'OCR API failed', isMarksheet: false };
    }
    const extractedText = result.ParsedResults[0]?.ParsedText || '';
    const isMarksheet =
      /\b(subjects?|marks?\b(?!.*total)|percentage|grade|score|cgpa|gpa)\b/i.test(
        extractedText
      );
    return { text: extractedText, isMarksheet };
  } catch (error) {
    console.error('Error processing file:', error);
    return { error: 'Error processing file', isMarksheet: false };
  }
}

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    const filePath1 = `./public${user[0].tenth_certificate}`;
    const filePath2 = `./public${user[0].twelfth_certificate}`;
    const result1 = await processFile(filePath1);
    const result2 = await processFile(filePath2);
    return res.status(200).json({
      tenth_certificate: result1,
      twelfth_certificate: result2,
    });
  } catch (error) {
    console.error('Error processing files:', error);
    return res.status(500).json({ error: 'Error processing files' });
  }
});

module.exports = router; 