const path = require("path");
const fs = require("fs");
const minecraftServer = require("./minecraft-server");

const { minecraftLogFile } = require("./constants");

function getAdmin(req, res) {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
}

function getApiLogs(req, res) {
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
  stream.on("close", () =>
    res.json({
      success: true,
      data: logs
    })
  );
}

function postApiCommand(req, res) {
  const { command } = req.body;
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
