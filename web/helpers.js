/**
 * Helper functions
 * Generally contains functions that have
 * to do with user authentication
 */

const fs = require("fs");
const _ = require("lodash");

const { userDataFile } = require("./constants");

function readUserData(cb) {
  fs.readFile(userDataFile, (err, raw) => {
    if (err) {
      return cb(err);
    }
    const data = JSON.parse(raw);
    return cb(null, data);
  });
}

function findUserById(userId, cb) {
  readUserData((err, data) => {
    if (err) {
      return cb(err);
    }
    const user = data[userId];
    if (typeof user === "undefined") {
      return cb(null, undefined);
    }
    return cb(null, user);
  });
}

function findUserByKey(key, value, cb) {
  if (key !== "email" && key !== "username") {
    return cb(new Error("Invalid key"));
  }

  readUserData((err, data) => {
    if (err) {
      return cb(err);
    }
    const userIds = Object.keys(data);
    const { length } = userIds;
    for (let i = 0; i < length; i += 1) {
      const userId = userIds[i];
      const user = data[userId];
      // Do a case-insensitive search for username
      if (key === "username") {
        if (user.username.toLowerCase() === value.toLowerCase()) {
          return cb(null, user);
        }
      }
      if (user[key] === value) {
        return cb(null, user);
      }
    }
    return cb(null, undefined);
  });
}

// Express middleware
function isAuthorized(req, res, next) {
  findUserById(req.session.userId, (err, user) => {
    if (err || typeof user === "undefined") {
      // Redirect to home if not logged in
      res.redirect("/");
      /*
      return res.json({
        success: false,
        message: "Not logged in."
      });
      */
    }
    return next();
  });
}

function isAdmin(req, res, next) {
  // Check if localhost
  // From https://github.com/expressjs/express/issues/2518
  const { remoteAddress } = req.connection;
  if (_.includes(["127.0.0.1", "::ffff:127.0.0.1", "::1"], remoteAddress)) {
    return next();
  }

  findUserById(req.session.userId, (err, user) => {
    if (err || typeof user === "undefined") {
      return res.json({
        success: false,
        message: "Not logged in."
      });
    }
    if (user.username === "nate" || user.username === "wil") {
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
  readUserData,
  findUserById,
  findUserByKey
};
