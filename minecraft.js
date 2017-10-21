const { spawn } = require('child_process');
const path = require('path');
const { serverStartScriptFile } = require('./constants');

function startMinecraftServer() {
  try {
    const minecraftServer =
      spawn('cmd.exe', ['/c', serverStartScriptFile]);
    return minecraftServer;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  startMinecraftServer,
};
