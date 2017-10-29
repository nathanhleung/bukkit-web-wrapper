const log4js = require("log4js");
const path = require("path");

log4js.configure({
  appenders: {
    out: {
      type: "stdout"
    },
    app: {
      type: "file",
      filename: path.join(__dirname, "..", "server.log")
    }
  },
  categories: {
    default: {
      appenders: ["out", "app"],
      level: "debug"
    }
  }
});

const logger = log4js.getLogger();

module.exports = logger;
