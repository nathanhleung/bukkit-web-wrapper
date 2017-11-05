/**
 * Routes
 * Route handlers.
 */

const fs = require("fs");
const yaml = require("js-yaml");
const bcrypt = require("bcrypt");
const uuid = require("uuid/v4");
const validator = require("validator");

const minecraftServer = require("../minecraft-server");
const logger = require("../logger");
const { userDataFile, permissionsDataFile } = require("../constants");
const { findUserById, findUserByKey } = require("../helpers");

function getHome(req, res) {
  if (req.session.userId) {
    findUserById(req.session.userId, (err, user) => {
      if (!err && typeof user !== "undefined") {
        return res.redirect("/profile");
      }
      return res.render("home");
    });
  } else {
    return res.render("home");
  }
}

/*
function postRegister(req, res) {
  const { name, email, username, password, fingerprint } = req.body;

  const valid = db.isValidUser(name, email, username, password);
  if (valid) {
    return res.json({
      success: false,
      message: valid
    });
  }
  console.log("got to user add");
  db.addUser(name, email, username, password);
  let user = null;
  db.queryUserByMCUser(username, (err, res) => {
    if (err) {
      logger.log(err);
      throw err;
    }
    user = res;
    console.log(res.toString());
  });
  db.logUserInfo(user.user_id, fingerprint, req.ip);
  req.session.userId = user.user_id;
  res.redirect("/profile");
}
*/

/**
 * POST /register
 * Checks if the user has valid information and doesn't already
 * exist, and registers them into the web system and on the
 * Bukkit server.
 */
function postRegister(req, res) {
  const { email, username, password, fingerprint } = req.body;

  let valid = true;
  valid = valid && validator.isEmail(email);
  valid = valid && validator.isLength(username, { min: 1 });
  valid = valid && validator.isAlphanumeric(username);
  valid = valid && validator.isLength(password, { min: 8 });
  if (!valid) {
    return res.json({
      success: false,
      message: "Invalid input. Perhaps your username is not alphanumeric?"
    });
  }

  findUserByKey("username", username, (err, user) => {
    if (err) {
      logger.error(err);
      throw err;
    }
    if (user && typeof user !== "undefined") {
      return res.json({
        success: false,
        message: "User with that username already exists."
      });
    }

    checkEmail();
  });

  function checkEmail() {
    findUserByKey("email", email, (err, user) => {
      if (err) {
        logger.error(err);
        throw err;
      }
      if (user && typeof user !== "undefined") {
        return res.json({
          success: false,
          message: "User with that email already exists."
        });
      }

      registerUser();
    });
  }

  function registerUser() {
    const userId = uuid();

    bcrypt.hash(password, 10, (err, hashed) => {
      if (err) {
        logger.error(err);
        throw err;
      }
      addToDataFile(email, username, hashed);
    });

    function addToDataFile(email, username, hashed) {
      fs.readFile(userDataFile, (err, raw) => {
        if (err) {
          logger.error(err);
          throw err;
        }
        const data = JSON.parse(raw);
        data[userId] = {
          id: userId,
          email,
          username,
          password: hashed,
          hostname: req.hostname,
          ip: req.ip,
          ips: req.ips,
          fingerprint
        };
        const newRaw = JSON.stringify(data, null, 2);
        saveDataFile(newRaw);
      });
    }

    function saveDataFile(newRaw) {
      fs.writeFile(userDataFile, newRaw, err => {
        if (err) {
          logger.error(err);
          throw err;
        }
        registerOnServer(username);
      });
    }

    function registerOnServer(username) {
      try {
        const permissionsData = yaml.safeLoad(
          fs.readFileSync(permissionsDataFile, "utf8")
        );
        if (typeof permissionsData.users[username] === "undefined") {
          permissionsData.users[username] = {};
          permissionsData.users[username].group = ["member"];
        }
        fs.writeFileSync(permissionsDataFile, yaml.safeDump(permissionsData));

        // Reload server so new permissions are stored
        minecraftServer.stdin.write("reload\n");
        // Set auth data in session
        req.session.userId = userId;
        res.redirect("/profile");
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
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

  findUserByKey("username", username, (err, user) => {
    if (err) {
      logger.error(err);
      throw err;
    }

    if (typeof user === "undefined") {
      return res.json({
        success: false,
        message: "Invalid username or password."
      });
    }

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
      req.session.userId = user.id;
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
  postRegister,
  postLogin,
  getLogout
};
