const mysql = require("mysql");
const bcrypt = require("bcrypt");
const validator = require("validator");

const minecraftServer = require("./minecraft-server");
const logger = require("./logger");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Reed123!",
  database: "minecraft"
});

con.connect(err => {
  if (err) {
    logger.log(err);
    throw err;
  } else {
    console.log("connected sucessfully to mysql server");
  }
});

function addUser(name, email, mc_user, pass) {
  bcrypt.hash(pass, 10, (err, hash) => {
    con.query(
      "INSERT INTO users " +
        "(name, email, minecraft_user, pass) VALUES " +
        "(?, ?, ?, ?)",
      name,
      email,
      mc_user,
      hash,
      (err, res) => {
        if (err) {
          logger.error(err);
          throw err;
        }
        console.log("inserted row 1 row into users table");
      }
    );
  });

  queryUserByMCUser(mc_user, (err, user) => {
    if (err) {
      logger.error(err);
      throw err;
    }
    console.log(res.toString());
    con.query(
      "INSERT INTO membership_status_hist (user_id, status, comment) VALUES (?, 'pending', 'application submission')",
      user.user_id,
      (err, res) => {
        if (err) {
          logger.error(err);
          throw err;
        }
      }
    );
  });
}

function isValidUser(name, email, mc_user) {
  let valid = "";

  valid = isValidName(name);
  if (valid) {
    return valid;
  }
  valid = isValidEmail(email);
  if (valid) {
    return valid;
  }
  valid = isValidMCUser(mc_user);
  if (valid) {
    return valid;
  }

  return valid;
}

function isValidName(name) {
  let valid = "";

  if (validator.isLength(name, { min: 500 })) {
    valid = "name is too long";
  } else {
    con.query("SELECT * FROM users WHERE name = ?", name, (err, result) => {
      if (err) {
        logger.error(err);
        throw err;
      } else if (result.length > 0) {
        valid = "there is already an account with this name";
      }
    });
  }

  return valid;
}

function isValidEmail(email) {
  let valid = "";

  if (!validator.isEmail(email)) {
    valid = "email is not actually an email";
  } else if (validator.isLength(email, { min: 100 })) {
    valid = "email is too long";
  } else {
    con.query("SELECT * FROM users WHERE email = ?", email, (err, result) => {
      if (err) {
        logger.error(err);
        throw err;
      } else if (result.length > 0) {
        valid = "there is already an account with this email";
      }
    });
  }

  return valid;
}

function isValidMCUser(mc_user) {
  let valid = "";

  if (validator.isLength(mc_user, { min: 100 })) {
    valid = "username is too long";
  } else {
    con.query(
      "SELECT * FROM users WHERE minecraft_user = ?",
      mc_user,
      (err, result) => {
        if (err) {
          logger.error(err);
          throw err;
        } else if (result.length > 0) {
          valid = "there is already an account with this minecraft username";
        }
      }
    );
  }

  return valid;
}

function queryUserByUserID(user_id, callback) {
  con.query("SELECT * FROM users WHERE user_id = ?", user_id, (err, users) => {
    if (err) {
      callback(err);
    } else if (result.length == 0) {
      callback("there are no users with this id");
    } else {
      callback(null, users[0]);
    }
  });
}

function queryUserByEmail(email, callback) {
  con.query("SELECT * FROM users WHERE email = ?", email, (err, users) => {
    if (err) {
      callback(err);
    } else if (result.length == 0) {
      callback("there are no users with this email");
    } else {
      callback(null, users[0]);
    }
  });
}

function queryUserByMCUser(mc_user, callback) {
  con.query(
    "SELECT * FROM users WHERE minecraft_user = ?",
    mc_user,
    (err, users) => {
      if (err) {
        callback(err);
      } else if (result.length == 0) {
        callback("there are no users with this username");
      } else {
        callback(null, users[0]);
      }
    }
  );
}

function changeBukkitPermissions(mc_user, perm_level) {
  minecraftServer.stdin.write(
    `pex user ${mc_user} group add ${perm_level}\n`
  );
}

function changeUserPermissionLevel(user_id, new_perm_level) {
  changeBukkitPermissions(mc_user, new_perm_level);

  con.query(
    "UPDATE users SET perm_level = ? WHERE user_id = ?",
    new_perm_level,
    user_id,
    (err, result) => {
      if (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}

function getAllUsers() {
  let result = null;
  con.query("SELECT * FROM users", (err, qresult) => {
    if (err) {
      logger.error(err);
      throw err;
    } else {
      result = qresult;
    }
  });
  return result;
}

function logUserInfo(user_id, fingerprint, ip_address) {
  con.query(
    "INSERT INTO user_info (user_id, fingerprint, ip_address) VALUES (?, ?, ?)",
    user_id,
    fingerprint,
    ip_address,
    (err, qresult) => {
      if (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}

function changeMembershipStatus(user_id, mem_status, comment) {
  con.query(
    "UPDATE users SET membership_status = ? WHERE user_id = ?",
    mem_status,
    user_id,
    (err, result) => {
      if (err) {
        logger.error(err);
        throw err;
      }
    }
  );

  con.query(
    "INSERT INTO membership_status_hist (user_id, status, comment) VALUES (?, ?, ?)",
    user_id,
    mem_status,
    comment,
    (err, res) => {
      if (err) {
        logger.error(err);
        throw err;
      }
    }
  );
}

module.exports = {
  con,
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
  changeMembershipStatus
};
