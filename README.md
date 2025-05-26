# Bring Your Buddy Backend

This is the backend server for the Bring Your Buddy application. It provides RESTful API endpoints for the frontend application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=buddy
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

3. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

The server exposes the following API endpoints:

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/verify-otp` - Verify OTP for email verification
- `POST /api/resend-otp` - Resend OTP for email verification
- `POST /api/forget-password/request` - Request password reset
- `POST /api/forget-password/reset` - Reset password with OTP

### User Profile
- `PUT /api/update-profile` - Update user profile

### Data Endpoints
- `GET /api/universities` - Get all universities
- `GET /api/programs` - Get all programs
- `GET /api/countries` - Get all countries
- `GET /api/fetchcoursetypes` - Get all course types
- `GET /api/fetchcoursetrades` - Get all course trades

### Document Management
- `POST /api/scan-documents` - Scan documents
- `POST /api/send-documents` - Send documents to universities
- `GET /api/getuserbyemail/:email` - Get user by email
- `POST /api/documentverify/update-status` - Update document verification status

### Application Process
- `POST /api/offer-letter/request` - Request offer letter
- `POST /api/offer-letter/update-status` - Update offer letter status
- `POST /api/application-submitted` - Submit application
- `POST /api/airport-pickup/request` - Request airport pickup
- `POST /api/appointment-notification/create` - Create appointment notification
- `GET /api/checklist-documents/user/:userId` - Get checklist documents for a user

### Payment and Orders
- `POST /api/create-order` - Create a new order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/order/:orderId` - Get payment details for an order

### Other Services
- `GET /api/embassy` - Get all embassies
- `GET /api/marks` - Get all marks
- `POST /api/manual-email-uni` - Send manual email to university
- `GET /api/commission/agent/:agentId` - Get commission details for an agent

## Database Structure

The application uses a MySQL database with tables for users, universities, programs, applications, documents, and more.

## File Structure

```
backend/
├── config/
│   └── db.js              # Database configuration
├── routes/
│   ├── login.js           # Login route
│   ├── register.js        # Registration route
│   └── ...                # Other route handlers
├── utils/
│   └── helpers.js         # Utility functions
├── uploads/               # Uploaded files directory
├── .env                   # Environment variables
├── package.json           # Project dependencies
├── server.js              # Main server file
└── README.md              # This file
``` 