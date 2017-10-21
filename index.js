const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const fs = require('fs');
const uuid = require('uuid/v4');
const session = require('express-session');
const validator = require('validator');
const _ = require('lodash');
const nbt = require('nbt');

const { userDataFile } = require('./constants');
const { isAuthorized, findUserById, findUserByKey } = require('./helpers');

const app = express();
app.set('port', process.env.PORT || 80);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'), {
	maxAge: '1y',
}));
app.use(session({
	// keyboard mash
	secret: 'wertyhuiln fuh2849t85&^TO&(*POAS^S&Yxtruyfgkjg r32r',
	resave: true,
	saveUninitialized: false,
}));

app.post('/register', (req, res) => {
	const { email, username, password } = req.body;

	let valid = true;
	valid = valid && validator.isEmail(email)
	valid = valid && validator.isLength(username, { min: 1 });
	valid = valid && validator.isLength(password, { min: 8 });
	if (!valid) {
		res.json({
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
			res.json({
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
				res.json({
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
				};
				const newRaw = JSON.stringify(data);
				saveDataFile(newRaw);
			});
		}

		function saveDataFile(newRaw) {
			fs.writeFile(userDataFile, newRaw, (err) => {
				if (err) {
					console.log(err);
					throw err;
				}
				// Set auth data in session
				req.session.userId = userId;
				res.redirect('/profile');
			});
		}
	}
});

app.post('/login', (req, res) => {
	const { username, password } = req.body;

	let valid = true;
	valid = valid && validator.isLength(username, { min: 1 });
	valid = valid && validator.isLength(password, { min: 8 });
	if (!valid) {
		res.json({
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
			res.redirect('/profile.html');
		});
	});
});

app.get('/logout', (req, res) => {
	if (req.session) {
		req.session.destroy((err) => {
			if (err) {
				console.log(err);
				throw err;
			}
			res.redirect('/');
		});
	}
});

app.get('/api/profile', isAuthorized, (req, res) => {
	findUserById(req.session.userId, (err, user) => {
		if (err) {
			console.log(err);
			throw err;
		}
		res.json({
			success: true,
			data: _.omit(user, ['password'])
		});
	});
});

// this is probably dangerous bc of filesystem access
// at least its read only
app.get('/api/user', isAuthorized, (req, res) => {
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
				res.json(data);
			});
		});
	}
});

app.get('*', (req, res) => {
	res.status(404);
	res.sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(app.get('port'), () => {
	console.log(`App listening on port ${app.get('port')}.`);
});
