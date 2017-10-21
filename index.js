const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require('express-session');

const { startMinecraftServer } = require('./minecraft');
const { isAuthorized, isAdmin } = require('./helpers');
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

app.get('*', (req, res) => {
	res.status(404);
	res.sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(app.get('port'), () => {
	console.log(`App listening on port ${app.get('port')}.`);
});
