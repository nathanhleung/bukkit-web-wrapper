/**
 * Route handlers for administrator-
 * restricted routes
 */

const path = require("path");
const fs = require("fs");
const minecraftServer = require("./minecraft-server");

const { minecraftLogFile } = require("./constants");

/**
 * GET /admin
 * Sends back the public/admin.html file
 */
function getAdmin(req, res) {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
}

/**
 * GET /api/logs
 * Reads logs from the Minecraft server
 * log file (not entire server log file)
 * and sends them back
 */
function getApiLogs(req, res) {
  // Get size of log file
  const { size } = fs.statSync(minecraftLogFile);
  // Get last 10000 bytes of logs
  const stream = fs.createReadStream(minecraftLogFile, {
    start: size - 10000,
    end: size
  });
  let logs = "";
  stream.on("data", data => {
    logs += data;
  });
  // After all data is read,
  // send logs back
  stream.on("close", () =>
    res.json({
      success: true,
      data: logs
    })
  );
}

/**
 * POST /api/command
 * Runs the sent command
 * in the minecraft server
 * (e.g. list, say, etc.)
 */
function postApiCommand(req, res) {
  const { command } = req.body;
  // Pipe command to Minecraft server instance
  minecraftServer.stdin.write(`${command}\n`);
  return res.json({
    success: true
  });
}

module.exports = {
  getAdmin,
  getApiLogs,
  postApiCommand
};
