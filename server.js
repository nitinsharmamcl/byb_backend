require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database
const db = require('./config/db');

// Routes
app.use('/api/login', require('./routes/student/login'));
app.use('/api/register', require('./routes/student/register'));
app.use('/api/verify-otp', require('./routes/student/verify-otp'));
app.use('/api/resend-otp', require('./routes/student/resend-otp'));
app.use('/api/forget-password', require('./routes/student/forget-password'));
app.use('/api/update-profile', require('./routes/student/update-profile'));
app.use('/api/universities', require('./routes/student/universities'));
app.use('/api/programs', require('./routes/student/programs'));
app.use('/api/countries', require('./routes/student/countries'));
app.use('/student/fetchcoursetypes', require('./routes/student/fetchcoursetypes'));
app.use('/student/fetchcoursetrades', require('./routes/student/fetchcoursetrades'));
app.use('/student/send-documents', require('./routes/student/send-documents'));
app.use('/api/getuserbyemail', require('./routes/student/getuserbyemail'));
app.use('/student/offer-letter', require('./routes/student/offer-letter'));
app.use('/api/documentverify', require('./routes/student/documentverify'));
app.use('/api/application-submitted', require('./routes/student/application-submitted'));
app.use('/api/airport-pickup', require('./routes/student/airport-pickup'));
app.use('/api/airport-pickup/get-status', require('./routes/student/airport-pickup-get-status'));
app.use('/api/airport-pickup/airport-ticket', require('./routes/student/airport-pickup-airport-ticket'));
app.use('/student/appointment-notification', require('./routes/student/appointment-notification'));
app.use('/student/checklist-documents', require('./routes/student/checklist-documents'));
// app.use('/api/create-order', require('./routes/student/create-order'));
app.use('/student/embassy', require('./routes/student/embassy'));
// app.use('/api/marks', require('./routes/student/marks'));
app.use('/api/payment', require('./routes/student/payment'));
app.use('/api/payment/getpaymentinfo', require('./routes/student/payment-getpaymentinfo'));
app.use('/api/payment/university-payment', require('./routes/student/payment-university-payment'));
app.use('/api/payment/university-payment/get-university-reciept', require('./routes/student/payment-university-payment-get-university-reciept'));
app.use('/api/manual-email-uni', require('./routes/student/manual-email-uni'));
app.use('/api/manual-email-uni/request-airport-document', require('./routes/student/manual-email-uni-request-airport-document'));
app.use('/api/manual-email-uni/request-embassy', require('./routes/student/manual-email-uni-request-embassy'));
app.use('/api/manual-email-uni/request-ugc-letter', require('./routes/student/manual-email-uni-request-ugc-letter'));
app.use('/api/manual-email-uni/request-visa-letter', require('./routes/student/manual-email-uni-request-visa-letter'));
app.use('/api/manual-email-uni/update-status', require('./routes/student/manual-email-uni-update-status'));
app.use('/api/manual-email-uni/get-status', require('./routes/student/manual-email-uni-get-status'));
app.use('/api/manual-email-uni/request-addmission-letter', require('./routes/student/manual-email-uni-request-addmission-letter'));
app.use('/api/manual-email-uni/request-affilation-letter', require('./routes/student/manual-email-uni-request-affilation-letter'));
app.use('/api/manual-email-uni/request-bonafide-letter', require('./routes/student/manual-email-uni-request-bonafide-letter'));
app.use('/api/manual-email-uni/request-docs-letter', require('./routes/student/manual-email-uni-request-docs-letter'));
const studentCommission = require('./routes/student/commission');
const studentCommissionRequest = require('./routes/student/commission-request-commission');
const studentCommissionGet = require('./routes/student/commission-get-commission');
// const studentCommissionPayment = require('./routes/student/commission-payment-commission');
// console.log('studentCommissionPayment:', studentCommissionPayment);
// console.log('Type:', typeof studentCommissionPayment);
// app.use('/student/commission/payment-commission', studentCommissionPayment);
app.use('/student/commission', studentCommission);
app.use('/student/commission/request-commission', studentCommissionRequest);
app.use('/student/commission/get-commission', studentCommissionGet);
app.use('/api/admin/enquiry', require('./routes/admin/enquiry'));
app.use('/api/agent/get-agent', require('./routes/agent/get-agent'));
app.use('/api/admin/commission', require('./routes/admin/commission'));
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/programs', require('./routes/admin/programs'));
app.use('/api/admin/agents', require('./routes/admin/agents'));
app.use('/api/admin/applications', require('./routes/admin/applications'));
app.use('/api/admin/update-profile', require('./routes/admin/update-profile'));
app.use('/api/admin/universities', require('./routes/admin/universities'));
app.use('/api/agent/get-agent-students', require('./routes/agent/get-agent-students'));
app.use('/api/agent/login', require('./routes/agent/login'));
app.use('/api/agent/update-agent', require('./routes/agent/update-agent'));
app.use('/api/agent/update-student', require('./routes/agent/update-student'));
app.use('/api/agent/register', require('./routes/agent/register'));
app.use('/api/agent/upload-profile-image', require('./routes/agent/upload-profile-image'));
app.use('/api/admin/courses', require('./routes/admin/courses'));
app.use('/api/admin/dashboard', require('./routes/admin/dashboard'));
app.use('/api/admin/get-admin', require('./routes/admin/get-admin'));
app.use('/api/admin/login', require('./routes/admin/login'));
app.use('/api/admin/countries/getcountriescount', require('./routes/admin/countries-getcountriescount'));
app.use('/api/admin/doc-upload/admissionletter', require('./routes/admin/doc-upload-admissionletter'));
app.use('/api/admin/doc-upload/bonafiedletter', require('./routes/admin/doc-upload-bonafiedletter'));
app.use('/api/admin/doc-upload/offerletter', require('./routes/admin/doc-upload-offerletter'));
app.use('/api/admin/doc-upload/payment-receipt', require('./routes/admin/doc-upload-payment-receipt'));
app.use('/api/admin/doc-upload/request-documents', require('./routes/admin/doc-upload-request-documents'));
app.use('/api/admin/embassy', require('./routes/admin/embassy'));
app.use('/api/admin/payment/getstudentspaid', require('./routes/admin/payment-getstudentspaid'));
app.use('/api/admin/payments/:id', require('./routes/admin/payments-id'));
app.use('/api/admin/applications/:id', require('./routes/admin/applications-id'));
app.use('/api/admin/commission/commission-status-update', require('./routes/admin/commission-commission-status-update'));
app.use('/api/admin/commission/commission-reciept', require('./routes/admin/commission-commission-reciept'));
app.use('/api/admin/commission/commission-claim-email', require('./routes/admin/commission-commission-claim-email'));
app.use('/api/admin/commission/get-commission', require('./routes/admin/commission-get-commission'));
app.use('/api/admin/enquiry/getEnquiry', require('./routes/admin/enquiry-getEnquiry'));
app.use('/api/admin/programs/getProgram', require('./routes/admin/programs-getProgram'));
app.use('/api/admin/programs/:id', require('./routes/admin/programs-id'));
app.use('/api/admin/universities/getuniversitiescount', require('./routes/admin/universities-getuniversitiescount'));
app.use('/api/admin/universities/:id', require('./routes/admin/universities-id'));
app.use('/api/admin/users/getallstudents', require('./routes/admin/users-getallstudents'));
app.use('/api/admin/users/getappsubmittedcount', require('./routes/admin/users-getappsubmittedcount'));
app.use('/api/admin/users/getcompletestudents', require('./routes/admin/users-getcompletestudents'));
app.use('/api/admin/users/getofferlettercount', require('./routes/admin/users-getofferlettercount'));
app.use('/api/admin/users/getstu-paidfees', require('./routes/admin/users-getstu-paidfees'));
app.use('/api/admin/users/getusercount', require('./routes/admin/users-getusercount'));
app.use('/api/admin/users/:id', require('./routes/admin/users-id'));
app.use('/api/admin/verify/eligible', require('./routes/admin/verify-eligible'));
app.use('/api/admin/verify/not_eligible', require('./routes/admin/verify-not_eligible'));
app.use('/api/admin/users/get-marks/tenth-marks', require('./routes/admin/users-get-marks-tenth-marks'));
app.use('/api/admin/users/get-marks/twelth-marks', require('./routes/admin/users-get-marks-twelth-marks'));
app.use('/student/offer-letter/getofferletterbyemail', require('./routes/student/offer-letter-getofferletterbyemail'));
app.use('/student/offer-letter/getStatus', require('./routes/student/offer-letter-getStatus'));
app.use('/student/offer-letter/updatestatus', require('./routes/student/offer-letter-updatestatus'));
app.use('/student/programs/getprogrambycourseid', require('./routes/student/programs-getprogrambycourseid'));
app.use('/student/programs/getprogrambyid', require('./routes/student/programs-getprogrambyid'));
app.use('/student/universities/getprogramsbyuniversityid', require('./routes/student/universities-getprogramsbyuniversityid'));
app.use('/student/universities/getuniversitiesbycountryid', require('./routes/student/universities-getuniversitiesbycountryid'));
app.use('/student/universities/getuniversitybyid', require('./routes/student/universities-getuniversitybyid'));
app.use('/student/airport-pickup', require('./routes/student/airport-pickup'));
app.use('/student/airport-pickup-get-status', require('./routes/student/airport-pickup-get-status'));
app.use('/student/airport-pickup-airport-ticket', require('./routes/student/airport-pickup-airport-ticket'));
app.use('/student/application-submitted', require('./routes/student/application-submitted'));
app.use('/student/application-submitted-get-status', require('./routes/student/application-submitted-get-status'));
app.use('/student/register', require('./routes/student/register'));
app.use('/student/login', require('./routes/student/login'));
app.use('/student/forget-password', require('./routes/student/forget-password'));
app.use('/student/update-profile', require('./routes/student/update-profile'));
app.use('/student/verify-otp', require('./routes/student/verify-otp'));
app.use('/student/resend-otp', require('./routes/student/resend-otp'));
app.use('/student/getuserbyemail', require('./routes/student/getuserbyemail'));
app.use('/student/countries', require('./routes/student/countries'));
// app.use('/student/create-order', require('./routes/student/create-order'));
app.use('/student/documentverify', require('./routes/student/documentverify'));
app.use('/student/scan-documents', require('./routes/student/scan-documents'));
app.use('/student/scan-documents/bachelor-scan', require('./routes/student/scan-documents-bachelor-scan'));
app.use('/student/scan-documents/is-arts-student', require('./routes/student/scan-documents-is-arts-student'));
app.use('/student/scan-documents/is-commerce-student', require('./routes/student/scan-documents-is-commerce-student'));
app.use('/student/scan-documents/is-medical-student', require('./routes/student/scan-documents-is-medical-student'));
app.use('/student/scan-documents/is-nonmedical-student', require('./routes/student/scan-documents-is-nonmedical-student'));
app.use('/student/getdocumentsbyemail', require('./routes/student/send-document-getdocumentbyemail'));
app.use('/student/send-payment-reciept', require('./routes/student/send-payment-reciept'));
app.use('/student/appointment-notification-getreminder', require('./routes/student/appointment-notification-getreminder'));
app.use('/student/checklist-documents-get-documents', require('./routes/student/checklist-documents-get-documents'));
app.use('/student/checklist-documents-get-documents-get-status', require('./routes/student/checklist-documents-get-documents-get-status'));
app.use('/student/countries-allcountries', require('./routes/student/countries-allcountries'));
app.use('/student/countries-country_code', require('./routes/student/countries-country_code'));
app.use('/student/documentverify-detect-stream', require('./routes/student/documentverify-detect-stream'));
app.use('/student/documentverify-getStatus', require('./routes/student/documentverify-getStatus'));
app.use('/student/documentverify-iseligible', require('./routes/student/documentverify-iseligible'));
app.use('/student/documentverify-iseligible-getStatus', require('./routes/student/documentverify-iseligible-getStatus'));
app.use('/student/documentverify-updatetozero', require('./routes/student/documentverify-updatetozero'));
app.use('/student/embassy-embasy-doc-status', require('./routes/student/embassy-embasy-doc-status'));
app.use('/student/embassy-save-email', require('./routes/student/embassy-save-email'));
app.use('/student/embassy-visa-result', require('./routes/student/embassy-visa-result'));
app.use('/student/embassy-visa-status', require('./routes/student/embassy-visa-status'));
app.use('/student/embassy-visa-status-get-visa', require('./routes/student/embassy-visa-status-get-visa'));
app.use('/student/embassy-visa-status-get-visa-status', require('./routes/student/embassy-visa-status-get-visa-status'));
app.use('/api/marks/tenth-marks', require('./routes/student/marks-tenth-marks'));
app.use('/api/marks/twelfth-marks', require('./routes/student/marks-twelfth-marks'));
app.use('/api/marks/bachelor-marks', require('./routes/student/marks-bachelor-marks'));

// Test route
app.get('/', (req, res) => {
  res.send('Bring Your Buddy API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 