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
      return { error: 'OCR API failed', isMarksheet: false };
    }
    const extractedText = result.ParsedResults[0]?.ParsedText || '';
    const isBachelorCertificate =
      /\bbachelor(?:\s+of)?\s+(arts|science|technology|engineering|commerce|business|education)\b/i.test(
        extractedText
      );
    return {
      text: extractedText,
      isBachelorCertificate: isBachelorCertificate,
    };
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
    const filePath = `./public${user[0].bachelor_certificate}`;
    const result = await processFile(filePath);
    return res.status(200).json({
      bachelor_certificate: result,
    });
  } catch (error) {
    console.error('Error processing files:', error);
    return res.status(500).json({ error: 'Error processing files' });
  }
});

module.exports = router; 