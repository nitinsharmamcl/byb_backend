const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'sql5.freesqldatabase.com',
  user: 'sql5781213',
  password: 'YxSfBRBzKw',
  database: 'sql5781213',
});

module.exports = db; 
