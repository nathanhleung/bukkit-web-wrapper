const winston = require("winston");
const path = require("path");

// Causes a side effect which adds the Papertrail
// transport to the actual winston object
require('winston-papertrail').Papertrail;

const papertrailTransport = new winston.transports.Papertrail({
  host: process.env.PAPERTRAIL_HOST,
  port: process.env.PAPERTRAIL_PORT
});

const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(__dirname, "..", "server.log"),
    }),
    papertrailTransport,
  ],
});

papertrailTransport.on('error', (err) => {
  logger.error(err);
});

module.exports = logger;
