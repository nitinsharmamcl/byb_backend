const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// File upload helpers
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Generate OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Save file
const saveFile = async (file) => {
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.originalname.replace(/\s+/g, "_")}`;
  const filePath = path.join(uploadDir, fileName);
  
  // Create write stream for file
  const writeStream = fs.createWriteStream(filePath);
  
  // Write buffer to file
  writeStream.write(file.buffer);
  writeStream.end();
  
  return `/uploads/${fileName}`;
};

module.exports = {
  generateOTP,
  createTransporter,
  saveFile,
  uploadDir
}; 