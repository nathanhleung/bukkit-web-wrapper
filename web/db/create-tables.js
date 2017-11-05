/**
 * Initial setup of
 * database tables
 */

const fs = require("fs");
const path = require("path");

const logger = require("../logger");
const db = require("./db");

const createTablesSql = fs.readFileSync(
  path.join(__dirname, "sql", "createTables.sql")
);

async function createTables() {
  return new Promise((resolve, reject) => {
    db.query(createTablesSql, err => {
      if (err) {
        logger.error(err);
        return reject(err);
      }
      logger.info("Database tables created!");
      return resolve();
    });
  });
}

module.exports = createTables;
