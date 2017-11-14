/**
 * Connects to the MySQL database
 * and exports the resulting conection
 */

const mysql = require("mysql");
const logger = require("../logger");

// Specify connection details in
// .env file
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.on("connection", connection => {
  connection.on("error", err => {
    logger.error(err);
  });
});

module.exports = db;
