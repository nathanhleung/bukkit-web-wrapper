/**
 * Custom Logger Function
 *
 * Instead of using console.log and
 * just logging to the console, this
 * custom logger function allows
 * us to abstract away our logger
 * and log to the console, a file,
 * and an external service all in
 * one function call.
 */

const winston = require("winston");
const path = require("path");

// Causes a side effect which adds the Syslog
// transport to the actual winston object
require("winston-syslog").Syslog;

// Required to use syslog
winston.setLevels(winston.config.syslog.levels);

let logger;

if (process.env.NODE_ENV === 'test') {
  // Supress all logs in test environment
  logger = new winston.Logger({
    transports: null,
  });
} else {
  logger = new winston.Logger({
    level: "debug", // this level means pretty much everything is being logged
    // "transports" specifies the destinations for our logs
    transports: [
      new winston.transports.Console({
        handleExceptions: true
      }),
      new winston.transports.File({
        filename: path.join(__dirname, "..", "server.log"),
        handleExceptions: true
      }),
      new winston.transports.Syslog({
        app_name: "Bukkit Web Wrapper",
        host: process.env.PAPERTRAIL_HOST,
        port: process.env.PAPERTRAIL_PORT
      })
    ],
    exitOnError: false
  });
}

module.exports = logger;
