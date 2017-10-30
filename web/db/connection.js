/**
 * Connects to the MySQL database
 * and exports the resulting conection
 */

const mysql = require("mysql");
const logger = require("../logger");

// Specify connection details in
// .env file
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) {
    logger.error(err);
    throw err;
  } else {
    logger.info("Sucessfully connected to MySQL Server!");
  }
});

module.exports = connection;
