const mysql = require("mysql2");

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Gopal@7715",
    database: "rail",
    waitForConnections: true,
    connectionLimit: 10, // Adjust based on your needs
    queueLimit: 0
}).promise(); // Enables async/await for queries

module.exports = { pool };
