const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require('express-session');

const { startMinecraftServer } = require('./minecraft');
const { isAuthorized, isAdmin } = require('./helpers');
const { minecraftLogFile } = require('./constants');
const routes = require('./routes');

const minecraftServer = startMinecraftServer();

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

app.get('/', (req, res) => {
	if (req.session.userId) {
		findUserById(req.session.userId, (err, user) => {
	      if (!err && typeof user !== 'undefined') {
		    return res.redirect('/profile.html');
	      }
	      return res.sendFile(path.join(__dirname, 'public', 'index.html'));
	    });
	} else {
		return res.sendFile(path.join(__dirname, 'public', 'index.html'));
	}
})

// Reload minecraft server after user registration, so pass to route
app.post('/register', (req, res) => {
	return routes.postRegister(req, res, minecraftServer);
});

app.post('/login', routes.postLogin);

app.get('/logout', routes.getLogout);

app.get('/api/profile', isAuthorized, routes.getApiProfile);

// this is probably dangerous bc of filesystem access
// at least its read only
app.get('/api/user', isAuthorized, routes.getApiUser);

app.get('/admin', isAdmin, (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/logs',  isAdmin, (req, res) => {
	const { size } = fs.statSync(minecraftLogFile);
	// Get last 10000 bytes of logs
	const stream = fs.createReadStream(minecraftLogFile, {
		start: size - 10000,
		end: size,
	});
	let logs = '';
	stream.on('data', (data) => {
		logs += data;
	});
	stream.on('close', () => {
		return res.json({
			success: true,
			data: logs,
		});
	});
});

app.post('/api/command', isAdmin, (req, res) => {
	const { command } = req.body;
	minecraftServer.stdin.write(`${command}\n`);
	return res.json({
		success: true,
	});
});

app.get('*', (req, res) => {
	res.status(404);
	res.sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(app.get('port'), () => {
	console.log(`App listening on port ${app.get('port')}.`);
});
