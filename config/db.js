// const mysql = require('mysql2/promise');

// const db = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || 'root',
//   database: process.env.DB_NAME || 'bring_your_buddy',
// });

// module.exports = db; 


const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'sql5.freesqldatabase.com',
  user: process.env.DB_USER || 'sql5781213',
  password: process.env.DB_PASSWORD || 'YxSfBRBzKw',
  database: process.env.DB_NAME || 'sql5781213',
});

module.exports = db;
