/**
 * Helper functions
 * Generally contains functions that have
 * to do with user authentication
 */

const fs = require("fs");
const _ = require("lodash");

const { userDataFile } = require("./constants");
const { queryUserByUserID } = require("./db/queries");

function readUserData(cb) {
  fs.readFile(userDataFile, (err, raw) => {
    if (err) {
      return cb(err);
    }
    const data = JSON.parse(raw);
    return cb(null, data);
  });
}

// Express middleware
function isAuthorized(req, res, next) {
  queryUserByUserID(req.session.userId, (err, user) => {
    if (err || typeof user === "undefined") {
      // Redirect to home if not logged in
      return res.redirect("/");
    }
    return next();
  });
}

function isAdmin(req, res, next) {
  // Get X-Forwarded-For since we're behind NGINX
  const originalAddress = req.headers["x-forwarded-for"];
  // Check if localhost
  // From https://github.com/expressjs/express/issues/2518
  if (_.includes(["127.0.0.1", "::ffff:127.0.0.1", "::1"], originalAddress)) {
    return next();
  }

  queryUserByUserID(req.session.userId, (err, user) => {
    if (err || typeof user === "undefined") {
      return res.json({
        success: false,
        message: "Not logged in."
      });
    }
    if (user.minecraft_user === "nate" || user.minecraft_user === "wil") {
      return next();
    }
    return res.json({
      success: false,
      message: "Not admin."
    });
  });
}

module.exports = {
  isAuthorized,
  isAdmin,
  readUserData
};
