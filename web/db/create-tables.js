/**
 * Initial setup of
 * database tables
 */

const fs = require("fs");
const path = require("path");

const logger = require("../logger");
const connection = require("./connection");

const createTablesSql = fs.readFileSync(
  path.join(__dirname, "sql", "createTables.sql")
);

function createTables() {
  connection.query(createTablesSql, err => {
    if (err) {
      return logger.error(err);
    }
    return logger.info("Database tables created!");
  });
}

module.exports = createTables;
