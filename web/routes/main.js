/**
 * Routes
 * Route handlers.
 */

const bcrypt = require("bcrypt");
const validator = require("validator");

const logger = require("../logger");
const {
  isValidUser,
  addUser,
  logUserInfo,
  queryUserByMCUser,
  queryUserByUserID,
  NoUserExistsError
} = require("../db/queries");

function getHome(req, res) {
  if (req.session.userId) {
    queryUserByUserID(req.session.userId, (err, user) => {
      if (!err && typeof user !== "undefined") {
        return res.redirect("/profile");
      }
      return res.render("home");
    });
  } else {
    return res.render("home");
  }
}

function getProfile(req, res) {
  return res.render("profile");
}

function postRegister(req, res) {
  const { name, email, username, password, fingerprint } = req.body;

  // Store user_id in upper scope so we can access it throughout
  // the function after it's been set
  let user_id;

  isValidUser(name, email, username, password, addUserToDb);

  function addUserToDb(err, status) {
    if (err) {
      logger.error(err);
      return res.json({
        success: false,
        message: "An error occurred."
      });
    }
    if (!status.valid) {
      return res.json({
        success: false,
        message: status.message
      });
    }
    addUser(name, email, username, password, logUserInfoToDb);
  }

  function logUserInfoToDb(err, new_user_id) {
    user_id = new_user_id;
    if (err) {
      logger.error(err);
      return res.json({
        success: false,
        message: "An error occurred."
      });
    }
    logUserInfo(user_id, fingerprint, req.ip, setSessionCookie);
  }

  function setSessionCookie(err) {
    if (err) {
      logger.error(err);
      return res.json({
        success: false,
        message: "An error occurred."
      });
    }
    req.session.user_id = user_id;
    res.redirect("/profile");
  }
}

function postLogin(req, res) {
  const { username, password } = req.body;

  let valid = true;
  valid = valid && validator.isLength(username, { min: 1 });
  valid = valid && validator.isLength(password, { min: 8 });
  if (!valid) {
    return res.json({
      success: false,
      message: "Invalid input"
    });
  }

  queryUserByMCUser(username, (err, user) => {
    if (err instanceof NoUserExistsError) {
      return res.json({
        success: false,
        message: "That account is not registered yet. Try signing up!"
      });
    }

    if (err) {
      logger.error(err);
      return res.json({
        success: false,
        message: "An error occurred."
      });
    }

    // At this point, user is valid
    bcrypt.compare(password, user.password, (err, matches) => {
      if (err) {
        logger.error(err);
        throw err;
      }
      if (!matches) {
        return res.json({
          success: false,
          message: "Invalid username or password."
        });
      }
      req.session.userId = user.user_id;
      return res.redirect("/profile");
    });
  });
}

/**
 * GET /logout
 * Destroys the user's current active
 * session, forcing them to log in again
 */
function getLogout(req, res) {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        logger.error(err);
        throw err;
      }
      return res.redirect("/");
    });
  }
}

module.exports = {
  getHome,
  getProfile,
  postRegister,
  postLogin,
  getLogout
};
