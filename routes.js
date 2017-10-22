const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const bcrypt = require('bcrypt');
const uuid = require('uuid/v4');
const validator = require('validator');
const _ = require('lodash');
const nbt = require('nbt');

const { userDataFile, permissionsDataFile } = require('./constants');
const { findUserById, findUserByKey } = require('./helpers');

function postRegister(req, res, minecraftServer) {
	const { email, username, password, fingerprint } = req.body;

	let valid = true;
	valid = valid && validator.isEmail(email)
	valid = valid && validator.isLength(username, { min: 1 });
	valid = valid && validator.isAlphanumeric(username);
	valid = valid && validator.isLength(password, { min: 8 });
	if (!valid) {
		return res.json({
			success: false,
			message: 'Invalid input',
		});
	}

	findUserByKey('username', username, (err, user) => {
		if (err) {
			console.log(err);
			throw err;
		}
		if (user && typeof user !== 'undefined') {
			return res.json({
				success: false,
				message: 'User with that username already exists.'
			});
		}

		checkEmail();
	});

	function checkEmail() {
		findUserByKey('email', email, (err, user) => {
			if (err) {
				console.log(err);
				throw err;
			}
			if (user && typeof user !== 'undefined') {
				return res.json({
					success: false,
					message: 'User with that email already exists.'
				});
			}

			registerUser();
		});
	}

	function registerUser() {
		const userId = uuid();

		bcrypt.hash(password, 10, (err, hashed) => {
			if (err) {
				console.log(err);
				throw err;
			}
			addToDataFile(email, username, hashed);
		});

		function addToDataFile(email, username, hashed) {
			fs.readFile(userDataFile, (err, raw) => {
				if (err) {
					console.log(err);
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
					fingerprint,
				};
				const newRaw = JSON.stringify(data, null, 2);
				saveDataFile(newRaw);
			});
		}

		function saveDataFile(newRaw) {
			fs.writeFile(userDataFile, newRaw, (err) => {
				if (err) {
					console.log(err);
					throw err;
				}
				registerOnServer(username);
			});
		}

		function registerOnServer(username) {
			try {
				const permissionsData = yaml.safeLoad(
					fs.readFileSync(
						permissionsDataFile,
						'utf8'
					)
				);
				if (typeof permissionsData.users[username] === 'undefined') {
					permissionsData.users[username] = {};
					permissionsData.users[username].group = ['member'];
				}
				fs.writeFileSync(
					permissionsDataFile,
					yaml.safeDump(permissionsData)
				);

				// Reload server so new permissions are stored
				minecraftServer.stdin.write('reload\n');
				// Set auth data in session
				req.session.userId = userId;
				res.redirect('/profile.html');
			} catch (err) {
				console.log(err);
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
			message: 'Invalid input',
		});
	}

	findUserByKey('username', username, (err, user) => {
		if (err) {
			console.log(err);
			throw err;
		}

		if (typeof user === 'undefined') {
			return res.json({
				success: false,
				message: 'Invalid username or password.'
			});
		}

		bcrypt.compare(password, user.password, (err, matches) => {
			if (err) {
				console.log(err);
				throw err;
			}
			if (!matches) {
				return res.json({
					success: false,
					message: "Invalid username or password."
				});
			}
			req.session.userId = user.id;
			return res.redirect('/profile.html');
		});
	});
}

function getLogout(req, res) {
	if (req.session) {
		req.session.destroy((err) => {
			if (err) {
				console.log(err);
				throw err;
			}
			return res.redirect('/');
		});
	}
}

function getApiProfile(req, res) {
	findUserById(req.session.userId, (err, user) => {
		if (err) {
			console.log(err);
			throw err;
		}
		return res.json({
			success: true,
			data: _.omit(user, ['password'])
		});
	});
}

function getApiUser(req, res) {
	findUserById(req.session.userId, (err, user) => {
		if (err) {
			console.log(err);
			throw err;
		}
		const { username } = user;
		readDataFile(username);
	});

	function readDataFile(username) {
		fs.readFile(path.join(__dirname, 'nate.dat'), (err, raw) => {
			if (err) {
				console.log(err);
				throw err;
			}
			nbt.parse(raw, (err, data) => {
				if (err) {
					console.log(err);
					throw err;
				}
				return res.json(data);
			});
		});
	}
}

module.exports = {
	postRegister,
	postLogin,
	getLogout,
	getApiProfile,
	getApiUser,
};
