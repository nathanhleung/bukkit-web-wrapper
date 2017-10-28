const { spawn } = require('child_process');
const path = require('path');
const { minecraftServerRoot, minecraftServerJarFile } = require('./constants');
const logger = require('./logger');

var minecraftServerInstance = null;

function startMinecraftServer() {
  /* The essential option is -nojline! Messes with the stdin, with the option
  we can pipe in input like "reload" */
  // Make sure 64-bit Java is installed, if not, max ram is 1G (not 3G)
  const minecraftServer =
      spawn('java', ['-Xms1G', '-Xmx3G', '-jar', minecraftServerJarFile, '-nojline'], {
      	cwd: minecraftServerRoot,
      });

  minecraftServer.stdout.on('data', (data) => {
    logger.info(data.toString());
  });

  minecraftServer.stderr.on('data', (data) => {
    logger.info(data.toString());
  });

  minecraftServer.on('exit', (code) => {
    logger.info(`Minecraft Server exited with code ${code}`);
  });

  minecraftServerInstance = minecraftServer;
  return minecraftServer;
}

module.exports = {
  startMinecraftServer,
  minecraftServerInstance
};
