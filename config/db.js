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
<<<<<<< HEAD
  host: process.env.DB_HOST || 'sql5.freesqldatabase.com',
  user: process.env.DB_USER || 'sql5781213',
  password: process.env.DB_PASSWORD || 'YxSfBRBzKw',
  database: process.env.DB_NAME || 'sql5781213',
});

module.exports = db;
=======
  host: 'sql5.freesqldatabase.com',
  user: 'sql5781213',
  password: 'YxSfBRBzKw',
  database: 'sql5781213',
});

module.exports = db; 
>>>>>>> 32235f4160e79b4ed0a13625b6e5d42da6915f53
