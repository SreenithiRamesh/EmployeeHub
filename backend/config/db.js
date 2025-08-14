
const mysql = require('mysql2/promise');
require('dotenv').config();


const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'sree753#@!',
  database: process.env.DB_NAME || 'employee_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 10000, 
  timezone: '+00:00', 
  charset: 'utf8mb4' 
});


async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log('✅ MySQL database connected successfully');
    
   
    const [rows] = await connection.query('SELECT VERSION() as version');
    console.log(`MySQL Server version: ${rows[0].version}`);
  } catch (err) {
    console.error(' MySQL connection error:', err.message);
    process.exit(1); 
  } finally {
    if (connection) connection.release();
  }
}

testConnection();

module.exports = {
  pool,
  getConnection: () => pool.getConnection(),
  query: (sql, params) => pool.query(sql, params)
};