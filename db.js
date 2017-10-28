const mysql = require('mysql');
const bcrypt = require('bcrypt');

const minecraft = require('./minecraft');
const logger = require('./logger');

const con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "Reed123!"
	database: "minecraft"
});

function addUser(first, last, email, mc_user, pass){
	bcrypt.hash('myPassword', 10, (err, hash) => {
		con.query(	"INSERT INTO users " +
					"(first_name, last_name, email, minecraft_user, pass, perm_level) VALUES " +
					"(?, ?, ?, ?, ?, ?)",
					first, last, email, mc_user, hash, perm_level,
					(err, res) => {
						if (err) {
							logger.error(err);
							throw err;
						}
					}
		);}
	);

	con.query(
		"INSERT INTO membership_status_hist (minecraft_user, status, comment) VALUES (?, 'pending', 'application submission')",
		mc_user,
		(err, res) => {
			if (err) {
				logger.error(err);
				throw err;
			}
		}
	);
}

function isUniqueUser(first, last, email, mc_user){
	var valid = "";
	if ( 	valid = hasUniqueName(first, last) ||
			valid = hasUniqueEmail(email) ||
			valid = hasUniqueMCUser(mc_user)) {
		return valid;
	}
	return valid;
}

function hasUniqueName(first, last){
	var valid = "";

	con.query(	"SELECT * FROM users WHERE first_name = ? AND last_name = ?",
		first,
		last,
		(err, result) => {
			if (err) {
				logger.error(err);
				throw err;
			} else if (result.length > 0){
				valid = "there is already an account with this name";
			}
		})

	return valid;
}

function hasUniqueEmail(email){
	var valid = "";

	con.query(	"SELECT * FROM users WHERE email = ?",
		email,
		(err, result) => {
			if (err) {
				logger.error(err);
				throw err;
			} else if (result.length > 0){
				valid = "there is already an account with this email";
			}
		})

	return valid;
}

function hasUniqueMCUser(mc_user){
	var valid = "";

	con.query(	"SELECT * FROM users WHERE minecraft_user = ?",
		mc_user,
		(err, result) => {
			if (err) {
				logger.error(err);
				throw err;
			} else if (result.length > 0){
				valid = "there is already an account with this minecraft username";
			}
		})

	return valid;
}

function queryUserByName(first, last, callback) {
	con.query(	"SELECT * FROM users WHERE first_name = ? AND last_name = ?",
		first, last,
		(err, users) => {
			if (err) {
				callback(err);
			} else if (result.length == 0){
				callback("there are no users with this name");
			} else {
				callback(null, users[0]);
			}
		})
}

function queryUserByMCUser(mc_user, callback){
	con.query(	"SELECT * FROM users WHERE minecraft_user = ?",
		mc_user,
		(err, users) => {
			if (err) {
				callback(err);
			} else if (result.length == 0){
				callback("there are no users with this username");
			} else {
				callback(null, users[0]);
			}
		})
}

function queryUserByEmail(email, callback) {
	con.query(	"SELECT * FROM users WHERE email = ?",
		email,
		(err, users) => {
			if (err) {
				callback(err);
			} else if (result.length == 0){
				callback("there are no users with this email");
			} else {
				callback(null, users[0]);
			}
		})
}

var { permissionsDataFile } = require('./constants');

function registerOnServer(mc_user, perm_level) {
	minecraft.minecraftServerIntstance.stdin.write('pex user ' + mc_user + ' group add ' perm_level + '\n');
}

function changeUserPermissionLevel(mc_user, new_perm_level) {
	registerOnServer(mc_user, new_perm_level);

	con.query("UPDATE users SET perm_level = ? WHERE minecraft_user = ?", new_perm_level, mc_user, (err, result) => {
	    if (err) {
	    	logger.error(err);
	    	throw err;
	    }
  	});
}

function getAllUsers() {
	var result = null;
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

function logUserInfo(mc_user, fingerprint, ip_address) {
	con.query("INSERT INTO user_info (minecraft_user, fingerprint, ip_address) VALUES (?, ?, ?)",
		mc_user,
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

function changeMemberShipStatus(mc_user, mem_status, comment) {
	con.query("UPDATE users SET membership_status = ? WHERE minecraft_user = ?", mem_status, mc_user, 
		(err, result) => {
		    if (err) {
		    	logger.error(err);
		    	throw err;
	    	}
  		}
  	);

  	con.query(
		"INSERT INTO membership_status_hist (minecraft_user, status, comment) VALUES (?, ?, ?)",
		mc_user, mem_status, comment,
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
	isUniqueUser,
	hasUniqueName,
	hasUniqueMCUser,
	hasUniqueEmail,
	queryUserByEmail,
	queryUserByMCUser,
	queryUserByName,
	changeUserPermissionLevel,
	getAllUsers,
	logUserInfo
}