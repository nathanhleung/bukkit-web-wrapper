const { spawn } = require('child_process');
const path = require('path');
const { minecraftServerRoot, minecraftServerJarFile } = require('./constants');
const logger = require('./logger');

function startMinecraftServer() {
  /* The essential option is -nojline! Messes with the stdin, with the option
  we can pipe in input like "reload" */
  const minecraftServer =
      spawn('java', ['-Xms512M', '-Xmx1G', '-jar', minecraftServerJarFile, '-nojline'], {
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

  return minecraftServer;
}

module.exports = {
  startMinecraftServer,
};
