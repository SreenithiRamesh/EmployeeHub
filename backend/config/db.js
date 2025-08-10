// backend/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool with environment variables and fallback values
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'sree753#@!',
  database: process.env.DB_NAME || 'employee_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Additional recommended options:
  connectTimeout: 10000, // 10 seconds
  timezone: '+00:00', // UTC timezone
  charset: 'utf8mb4' // Supports full Unicode including emojis
});

// Test connection function
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log('✅ MySQL database connected successfully');
    
    // Optional: Check database version
    const [rows] = await connection.query('SELECT VERSION() as version');
    console.log(`📌 MySQL Server version: ${rows[0].version}`);
  } catch (err) {
    console.error('❌ MySQL connection error:', err.message);
    process.exit(1); // Exit with failure
  } finally {
    if (connection) connection.release();
  }
}

// Immediately test connection when this module loads
testConnection();

// Export the pool for use in other modules
module.exports = {
  pool,
  getConnection: () => pool.getConnection(),
  query: (sql, params) => pool.query(sql, params)
};