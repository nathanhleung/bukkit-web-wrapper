/**
 * Main app file
 * This code starts the entire app; both
 * the web server and the Bukkit server
 */

const express = require("express");
const path = require("path");
const morgan = require("morgan"); // Logging utility
const bodyParser = require("body-parser");
const fs = require("fs");
const session = require("express-session");
const readline = require("readline");

const { isAuthorized, isAdmin } = require("./helpers");
const routes = require("./routes");
const adminRoutes = require("./admin-routes");
const minerRoutes = require("./miner-routes");
const logger = require("./logger"); // custom logger function

const minecraftServer = require('./minecraft-server');

const app = express();
app.set("port", process.env.PORT || 80);

// Tell Morgan to generate Apache-style logs,
// and send those logs to our custom logger
// function
app.use(
  morgan("combined", {
    stream: {
      write: data => {
        logger.debug(data);
      }
    }
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1y"
  })
);
app.use(
  session({
    // keyboard mash
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false
  })
);

app.get("/", (req, res) => {
  if (req.session.userId) {
    findUserById(req.session.userId, (err, user) => {
      if (!err && typeof user !== "undefined") {
        return res.redirect("/profile.html");
      }
      return res.sendFile(path.join(__dirname, "public", "index.html"));
    });
  } else {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
  }
});

app.post("/register", routes.postRegister);

app.post("/login", routes.postLogin);

app.get("/logout", routes.getLogout);

app.get("/api/users-online", routes.getApiUsersOnline);

app.get("/api/profile", isAuthorized, routes.getApiProfile);

// this is probably dangerous bc of filesystem access
// at least its read only
app.get("/api/user", isAuthorized, routes.getApiUser);

app.get("/admin", isAdmin, adminRoutes.getAdmin);

app.get("/api/logs", isAdmin, adminRoutes.getApiLogs);

app.post("/api/command", isAdmin, adminRoutes.postApiCommand);

app.get(
  "/api/user-hash-balance",
  isAuthorized,
  minerRoutes.getApiUserHashBalance
);

app.post(
  "/api/user-hash-withdraw",
  isAuthorized,
  minerRoutes.postApiUserHashWithdraw
);

app.get("*", (req, res) => {
  res.status(404);
  res.sendFile(path.join(__dirname, "public", "404.html"));
});

// Start the server on the port set above
// (in app.set("port"))
app.listen(app.get("port"), () => {
  logger.info(`App listening on port ${app.get("port")}.`);
});

// Accept input and send commands to server
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('line', (line) => {
  minecraftServer.stdin.write(`${line.trim()}\n`);
});

rl.prompt();

// Export for testing
module.exports = app;
