const { spawn } = require('child_process');
const path = require('path');
const { serverStartScriptFile } = require('./constants');

function startMinecraftServer() {
  const minecraftServer =
    spawn('cmd.exe', ['/c', serverStartScriptFile]);

  minecraftServer.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  minecraftServer.stderr.on('data', (data) => {
    console.log(data.toString());
  });

  minecraftServer.on('exit', (code) => {
    console.log(`Minecraft Server exited with code ${code}`);
  });

  return minecraftServer;
}

module.exports = {
  startMinecraftServer,
};
