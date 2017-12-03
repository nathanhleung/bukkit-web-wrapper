/**
 * Main app file
 * This code starts the entire app; both
 * the web server and the Bukkit server
 */

const express = require("express");
const path = require("path");
const morgan = require("morgan"); // Logging utility
const bodyParser = require("body-parser");
const session = require("express-session");
const readline = require("readline");

const { isAuthorized, isAdmin } = require("./helpers");
const mainRoutes = require("./routes/main");
const adminRoutes = require("./routes/admin");
const minerRoutes = require("./routes/miner");
const apiRoutes = require("./routes/api");
const dashboardRoutes = require("./dashboard");
const logger = require("./logger"); // custom logger function

const minecraftServer = require("./minecraft-server");
const createRestarter = require("./create-restarter");

logger.info("Starting Bukkit Web Wrapper...");

// Starts up the restart job
createRestarter(minecraftServer);

const app = express();
app.set("port", process.env.PORT || 80);

// Set view directory
// (We're not using a template engine, so this isn't actually required,
// but we're using it in the middleware below)
app.set("views", path.join(__dirname, "views"));
// Add "sendView" function to Response object
// (Don't want to override "render")
app.use((req, res, next) => {
  res.sendView = viewName => {
    res.sendFile(path.join(app.get("views"), `${viewName}.html`));
  };
  return next();
});

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
  express.static(path.join(__dirname, "assets"), {
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

app.get("/", mainRoutes.getHome);
app.get("/profile", isAuthorized, mainRoutes.getProfile);
app.post("/register", mainRoutes.postRegister);
app.post("/login", mainRoutes.postLogin);
app.get("/logout", mainRoutes.getLogout);
app.get("/api/version", apiRoutes.getApiVersion);
app.get("/api/users-online", apiRoutes.getApiUsersOnline);
app.get("/api/profile", isAuthorized, apiRoutes.getApiProfile);
// this is probably dangerous bc of filesystem access
// at least its read only
app.get("/api/user", isAuthorized, apiRoutes.getApiUser);
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
app.get(
  "/api/dashboard/online-count",
  dashboardRoutes.getApiDashboardOnlineCount
);

app.get("*", (req, res) => {
  res.status(404);
  return res.sendView("404");
});

// Start the server on the port set above
// (in app.set("port"))
app.listen(app.get("port"), () => {
  logger.info(`App listening on port ${app.get("port")}.`);
});

// Accept input and send commands to server
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on("line", line => {
  minecraftServer.stdin.write(`${line.trim()}\n`);
});

rl.prompt();

// Export for testing
module.exports = app;
