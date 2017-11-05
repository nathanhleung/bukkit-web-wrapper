const bcrypt = require("bcrypt");
const validator = require("validator");
const uuid = require("uuid/v4");

const minecraftServer = require("../minecraft-server");

const db = require("./db");

class NoUserExistsError extends Error {}

function addUser(name, email, mc_user, pass, cb) {
  const user_uuid = uuid();
  bcrypt.hash(pass, 10, insertUser);

  const normalizedEmail = email.toLowerCase();
  const normalizedMcUser = mc_user.toLowerCase();

  function insertUser(err, hash) {
    if (err) {
      return cb(err);
    }
    db.query(
      "INSERT INTO users (uuid, name, email, minecraft_user, pass) VALUES (?, ?, ?, ?, ?)",
      [user_uuid, name, normalizedEmail, normalizedMcUser, hash],
      getLastUserId
    );
  }

  function getLastUserId(err) {
    if (err) {
      return cb(err);
    }
    db.query("LAST_INSERT_ID()", getLastUser);
  }

  function getLastUser(err, results) {
    if (err) {
      return cb(err);
    }

    const lastUserId = results[0];

    queryUserByUserID(lastUserId, insertMembershipHistory);
  }

  function insertMembershipHistory(err, results) {
    if (err) {
      return cb(err);
    }

    const user = results[0];
    db.query(
      "INSERT INTO membership_status_hist (user_id, status, comment) VALUES (?, 'pending', 'application submission')",
      user.user_id,
      err => {
        if (err) {
          return cb(err);
        }
        return cb(null, user.user_id);
      }
    );
  }
}

function isValidUser(name, email, mc_user, password, cb) {

  // Check password synchronously
  if (!validator.isLength(password, { min: 8 })) {
    cb(null, {
      valid: false,
      message: 'Password must be at least 8 characters.',
    });
  }

  isValidName(name, returnNameStatus);

  function returnNameStatus(err, status) {
    if (err) {
      return cb(err);
    }
    if (!status.valid) {
      return cb(null, status);
    }
    return isValidEmail(email, returnEmailStatus);
  }

  function returnEmailStatus(err, status) {
    if (err) {
      return cb(err);
    }
    if (!status.valid) {
      return cb(null, status);
    }
    return isValidMCUser(mc_user, returnMcUserStatus);
  }

  function returnMcUserStatus(err, status) {
    if (err) {
      return cb(err);
    }
    if (!status.valid) {
      return cb(null, status);
    }
    // If no errors have been triggered thus far,
    // we should be fine
    return cb(null, status);
  }
}

function isValidName(name, cb) {
  const status = {
    valid: true,
    message: ""
  };

  if (!validator.isLength(name, { min: 1, max: 500 })) {
    status.valid = false;
    status.message = "Name must be between 1 and 500 characters.";
    return cb(null, status);
  }

  db.query("SELECT * FROM users WHERE name = ?", name, (err, result) => {
    if (err) {
      return cb(err);
    }

    if (result.length > 0) {
      status.valid = false;
      status.message = "An account with that name already exists.";
      return cb(null, status);
    }

    return cb(null, status);
  });
}

function isValidEmail(email, cb) {
  const status = {
    valid: true,
    message: ""
  };

  if (!validator.isEmail(email)) {
    status.valid = false;
    status.message = "This does not appear to be a valid email address.";
    return cb(null, status);
  }

  if (!validator.isLength(email, { min: 1, max: 100 })) {
    status.valid = false;
    status.message = "Email must be between 1 and 100 characters.";
    return cb(null, status);
  }

  queryUserByEmail(email, returnStatus);

  function returnStatus(err, result) {
    if (err instanceof NoUserExistsError) {
      return cb(null, status);
    }

    if (err) {
      return cb(err);
    }

    if (typeof result !== "undefined") {
      status.valid = false;
      status.message = "A user with that email already exists.";
      return cb(null, status);
    }
  }
}

function isValidMCUser(mc_user, cb) {
  const status = {
    valid: true,
    message: ""
  };

  // See https://help.mojang.com/customer/en/portal/articles/928638-minecraft-usernames?b_id=5408
  if (!validator.isLength(mc_user, { min: 3, max: 16 })) {
    status.valid = false;
    status.message = "Minecraft username must be between 3 and 16 characters";
    cb(null, status);
  }

  if (!validator.matches(mc_user, /[A-Za-z0-9_]+/)) {
    status.valid = false;
    status.message =
      "Minecraft username must contain only alphanumeric characcters and underscores.";
    cb(null, status);
  }

  queryUserByMCUser(mc_user, returnStatus);

  function returnStatus(err, result) {
    if (err instanceof NoUserExistsError) {
      return cb(null, status);
    }

    if (err) {
      return cb(err);
    }

    if (typeof result !== "undefined") {
      status.valid = false;
      status.message = "A user with that Minecraft username already exists.";
      return cb(null, status);
    }
  }
}

function queryUserByUserID(user_id, callback) {
  db.query("SELECT * FROM users WHERE user_id = ?", user_id, (err, result) => {
    if (err) {
      return callback(err);
    }
    if (result.length === 0) {
      return callback(new NoUserExistsError("There are no users with this id"));
    }

    return callback(null, result[0]);
  });
}

function queryUserByEmail(email, callback) {
  const normalizedEmail = email.toLowerCase();

  db.query(
    "SELECT * FROM users WHERE email = ?",
    normalizedEmail,
    (err, result) => {
      if (err) {
        return callback(err);
      }

      if (result.length === 0) {
        return callback(
          new NoUserExistsError("There are no users with this email")
        );
      }

      return callback(null, result[0]);
    }
  );
}

/**
 * Gets the user corresponding to the given Minecraft username
 * @param {string} mc_user - The user's minecraft username
 * @param {function} callback - The callback to be called when the search is finished
 */
function queryUserByMCUser(mc_user, callback) {
  const normalizedMcUser = mc_user.toLowerCase();

  db.query(
    "SELECT * FROM users WHERE minecraft_user = ?",
    normalizedMcUser,
    (err, result) => {
      if (err) {
        return callback(err);
      }

      if (result.length === 0) {
        return callback(
          new NoUserExistsError(
            "There are no users with this Minecraft username"
          )
        );
      }

      return callback(null, result[0]);
    }
  );
}

function changeUserPermissionLevel(user_id, new_perm_level, cb) {
  queryUserByUserID(user_id, sendCommandToServer);

  function sendCommandToServer(err, user) {
    if (err) {
      return cb(err);
    }
    const { minecraft_user } = user;
    minecraftServer.stdin.write(
      `pex user ${minecraft_user} group add ${new_perm_level}\n`
    );

    db.query(
      "UPDATE users SET perm_level = ? WHERE user_id = ?",
      [new_perm_level, user_id],
      cb
    );
  }
}

function getAllUsers(cb) {
  db.query("SELECT * FROM users", cb);
}

function logUserInfo(user_id, fingerprint, ip_address, cb) {
  db.query(
    "INSERT INTO user_info (user_id, fingerprint, ip_address) VALUES (?, ?, ?)",
    [user_id, fingerprint, ip_address],
    cb
  );
}

function changeMembershipStatus(user_id, mem_status, comment, cb) {
  db.query(
    "UPDATE users SET membership_status = ? WHERE user_id = ?",
    [mem_status, user_id],
    insertIntoHistory
  );

  function insertIntoHistory(err) {
    if (err) {
      return cb(err);
    }

    db.query(
      "INSERT INTO membership_status_hist (user_id, status, comment) VALUES (?, ?, ?)",
      [user_id, mem_status, comment],
      cb
    );
  }
}

module.exports = {
  addUser,
  isValidUser,
  isValidName,
  isValidMCUser,
  isValidEmail,
  queryUserByUserID,
  queryUserByEmail,
  queryUserByMCUser,
  changeUserPermissionLevel,
  getAllUsers,
  logUserInfo,
  changeMembershipStatus,
  NoUserExistsError
};
