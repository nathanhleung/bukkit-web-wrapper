/**
 * Routes
 * Route handlers.
 */

const bcrypt = require("bcrypt");
const validator = require("validator");
const uuid = require("uuid/v4");

const logger = require("../logger");
const {
  isValidUser,
  addUser,
  logUserInfo,
  queryUserByMCUser,
  queryUserByUserID,
  changeUserPermissionLevel,
  changeMembershipStatus,
  NoUserExistsError
} = require("../db/queries");

function getHome(req, res) {
  if (req.session.userId) {
    queryUserByUserID(req.session.userId, (err, user) => {
      if (!err && typeof user !== "undefined") {
        return res.redirect("/profile");
      }
      return res.sendView("home");
    });
  } else {
    return res.sendView("home");
  }
}

function getProfile(req, res) {
  return res.sendView("profile");
}

function postRegister(req, res) {
  const { name, email, username, password, fingerprint } = req.body;

  // Store user_id in upper scope so we can access it throughout
  // the function after it's been set
  let user_id;

  const user_uuid = uuid();
  isValidUser(name, email, username, password, checkStatus);

  function checkStatus(err, status) {
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
    return bcrypt.hash(password, 10, addUserToDb);
  }

  function addUserToDb(err, hashedPassword) {
    return addUser(
      name,
      email,
      username,
      hashedPassword,
      user_uuid,
      logUserInfoToDb
    );
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
    return logUserInfo(user_id, fingerprint, req.ip, addMembershipStatusToDb);
  }

  function addMembershipStatusToDb(err) {
    if (err) {
      logger.error(err);
      return res.json({
        success: false,
        message: "An error occurred."
      });
    }
    return changeMembershipStatus(
      user_id,
      "approved",
      "auto-approval",
      updateBukkitPerms
    );
  }

  function updateBukkitPerms(err) {
    if (err) {
      logger.error(err);
      return res.json({
        success: false,
        message: "An error occurred."
      });
    }

    return changeUserPermissionLevel(user_id, "member", setSessionCookie);
  }

  function setSessionCookie(err) {
    if (err) {
      logger.error(err);
      return res.json({
        success: false,
        message: "An error occurred."
      });
    }
    req.session.userId = user_id;
    req.session.save(err => {
      if (err) {
        logger.error(err);
        return res.json({
          success: false,
          message: "Failed to set session cookie."
        });
      }
      res.redirect("/profile");
    });
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
    bcrypt.compare(password, user.pass, (err, matches) => {
      if (err) {
        logger.error(err);
        return res.json({
          success: false,
          message: "An error occurred."
        });
      }
      if (!matches) {
        return res.json({
          success: false,
          message: "Invalid username or password."
        });
      }
      req.session.userId = user.user_id;
      // Don't redirect until after the session in-memory
      // has been saved to the session store
      req.session.save(err => {
        if (err) {
          logger.error(err);
          return res.json({
            success: false,
            message: "Failed to save session cookie."
          });
        }
        return res.redirect("/profile");
      });
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
