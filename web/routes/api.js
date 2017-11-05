/**
 * Routes
 * Route handlers.
 */

const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const yaml = require("js-yaml");
const request = require("request");

const pkg = require("../../package.json");
const logger = require("../logger");

const { queryUserByUserID } = require("../db/queries");
const { essentialsUserDataDir } = require("../constants");

/**
 * GET /api/version
 * Gets the version of the server.
 * Allows quick checks on the frontend
 * to ensure new version has deployed.
 */
function getApiVersion(req, res) {
  return res.json({
    success: true,
    data: pkg.version
  });
}

/**
 * GET /api/profile
 * Gets the currently logged in user's data
 * and returns it in JSON format
 */
function getApiProfile(req, res) {
  queryUserByUserID(req.session.userId, (err, user) => {
    if (err) {
      logger.error(err);
      return res.json({
        success: false,
        message: "An error occurred"
      });
    }
    return res.json({
      success: true,
      // Don't send back the hashed password
      data: _.omit(user, ["pass"])
    });
  });
}

/**
 * GET /api/user
 * Reads the user's Minecraft player data file
 */
function getApiUser(req, res) {
  queryUserByUserID(req.session.userId, (err, user) => {
    if (err) {
      logger.error(err);
      throw err;
    }
    const { minecraft_user } = user;
    readDataFile(minecraft_user);
  });

  function readDataFile(username) {
    const normalizedUsername = username.toLowerCase();
    const userDataFile = path.join(
      essentialsUserDataDir,
      `${normalizedUsername}.yml`
    );
    try {
      const userData = yaml.safeLoad(fs.readFileSync(userDataFile, "utf8"));
      res.json({
        success: true,
        data: userData
      });
    } catch (err) {
      logger.error(err);
      res.json({
        success: false
      });
    }
  }
}

/**
 * GET /api/users-online
 * Sends the "list" command to the
 * Bukkit server and gets the number
 * of users online
 */
function getApiUsersOnline(req, res) {
  // POST command to server
  request.post(
    {
      url: "http://localhost/api/command",
      form: { command: "list" }
    },
    (err, httpResponse, body) => {
      if (err) {
        logger.error(err);
        throw err;
      }
      try {
        const json = JSON.parse(body);
        if (!json.success) {
          logger.error(json.message);
          return;
        }
        // Wait a moment so server can run command,
        // then get logs
        setTimeout(getLogs, 1000);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  function getLogs() {
    // Get logs after running command
    request.get(
      {
        url: "http://localhost/api/logs"
      },
      (err, httpResponse, body) => {
        if (err) {
          logger.error(err);
          throw err;
        }
        try {
          const json = JSON.parse(body);
          if (!json.success) {
            logger.error(json.message);
            return;
          }
          const logs = json.data;
          // Split logs into lines
          const lines = logs.split("\n");
          // The result of the latest "list" command
          // will be the last line that matches the
          // expected output of the list command (i.e.
          // the regex)
          const index = _.findLastIndex(
            lines,
            line =>
              line.match(
                /There are (\d+)(\/\d+)? out of maximum \d+ players online.$/
              ) !== null
          );
          // 0 online is the default return
          let online = 0;
          // Index will be -1 if the command didn't end up running
          // or if the log never showed up
          if (index >= 0) {
            // First captured group will be number of players online
            online = lines[index].match(
              /There are (\d+)(\/\d+)? out of maximum \d+ players online.$/
            )[1];
          }
          return res.json({
            success: true,
            onlineCount: online
          });
        } catch (err) {
          logger.error(err);
          throw err;
        }
      }
    );
  }
}

module.exports = {
  getApiVersion,
  getApiUser,
  getApiProfile,
  getApiUsersOnline
};
