/**
 * Dashboard routes and data collection
 */

const schedule = require("node-schedule");
const request = require("request");
const fs = require("fs");

const logger = require("./logger");
const { onlineCountDataFile } = require("./constants");

// Save every 5 minutes
const saveOnlineCountJob = schedule.scheduleJob("*/5 * * * *", () => {
  request.get(
    {
      url: "http://localhost/api/users-online"
    },
    (err, httpResponse, body) => {
      if (err) {
        logger.error(err);
        return;
      }
      try {
        const json = JSON.parse(body);
        if (!json.success) {
          logger.error(json.message);
          return;
        }
        const { onlineCount } = json;
        const now = new Date().getTime();
        saveToFile(onlineCount, now);
      } catch (err) {
        logger.error(err);
      }
    }
  );

  function saveToFile(onlineCount, now) {
    // Add line to CSV file
    fs.appendFile(onlineCountDataFile, `${now},${onlineCount}\n`, err => {
      if (err) {
        logger.error(err);
      }
    });
  }
});

function getApiDashboardOnlineCount(req, res) {
  fs.readFile(onlineCountDataFile, "utf8", (err, data) => {
    if (err) {
      logger.error(err);
      return res.json({
        success: false,
        message: "An error occurred reading the data file."
      });
    }
    res.json({
      success: true,
      data
    });
  });
}

module.exports = {
  getApiDashboardOnlineCount
};
