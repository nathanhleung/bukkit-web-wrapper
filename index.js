const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require('express-session');
const log4js = require('log4js');

const minecraft = require('./minecraft');
const { isAuthorized, isAdmin } = require('./helpers');
const routes = require('./routes');
const adminRoutes = require('./admin-routes');
const logger = require('./logger');

//const minecraftServer = startMinecraftServer();

const app = express();
app.set('port', process.env.PORT || 80);
app.use(log4js.connectLogger(logger));

app.use(morgan('combined', {
	stream: {
		write: (data) => {
			logger.debug(data);
		},
	},
}));
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
	return routes.postRegister(req, res); //, minecraftServer);
});

app.post('/login', routes.postLogin);

app.get('/logout', routes.getLogout);

app.get('/api/users-online', routes.getApiUsersOnline);

app.get('/api/profile', isAuthorized, routes.getApiProfile);

// this is probably dangerous bc of filesystem access
// at least its read only
app.get('/api/user', isAuthorized, routes.getApiUser);

app.get('/admin', isAdmin, adminRoutes.getAdmin);

app.get('/api/logs', isAdmin, adminRoutes.getApiLogs);

app.post('/api/command', isAdmin, (req, res) => {
	return adminRoutes.postApiCommand(req, res, minecraft.minecraftServer);
});

app.get('*', (req, res) => {
	res.status(404);
	res.sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(app.get('port'), () => {
	logger.info(`App listening on port ${app.get('port')}.`);
});
