const { spawn } = require('child_process');
const path = require('path');
const { serverStartScriptFile } = require('./constants');

function startMinecraftServer() {
  const minecraftServer =
    spawn('cmd.exe', ['/c', serverStartScriptFile]);
  return minecraftServer;
}

module.exports = {
  startMinecraftServer,
};
