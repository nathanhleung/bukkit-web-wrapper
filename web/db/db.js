/**
 * Connects to the MySQL database
 * and exports the resulting conection
 */

const mysql = require("mysql");
const logger = require("../logger");

// Specify connection details in
// .env file
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    logger.error(err);
    throw err;
  } else {
    logger.info("Sucessfully connected to MySQL Server!");
  }
});

db.on("error", err => {
  logger.error(err);
  if (err.fatal) {
    db.connect(err => {
      if (err) {
        logger.err(err);
      }
    });
  }
});

module.exports = db;
