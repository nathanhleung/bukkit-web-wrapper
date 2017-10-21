const fs = require('fs');
const path = require('path');
const { userDataFile } = require('./constants');

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
    if (typeof user === 'undefined') {
      return cb(null, undefined);
    }
    return cb(null, user);
  });
}

function findUserByKey(key, value, cb) {
  if (key !== 'email' && key !== 'username') {
    return cb(new Error("Invalid key"));
  }

  readUserData((err, data) => {
    if (err) {
      return cb(err);
    }
    const userIds = Object.keys(data);
    const length = userIds.length;
    for (let i = 0; i < length; i += 1) {
      const userId = userIds[i];
      const user = data[userId];
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
    if (err || typeof user === 'undefined') {
      return res.json({
        success: false,
        message: 'Not logged in.'
      });
    }
    return next();
  })
}

function isAdmin(req, res, next) {
  findUserById(req.session.userId, (err, user) => {
    if (err || typeof user === 'undefined') {
      return res.json({
        success: false,
        message: 'Not logged in.'
      });
    }
    if (user.username !== 'nate') {
      return res.json({
        success: false,
        message: 'Not admin.'
      });
    }
    return next();
  });
}

module.exports = {
  isAuthorized,
  isAdmin,
  readUserData,
  findUserById,
  findUserByKey,
};
