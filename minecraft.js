const { spawn } = require('child_process');
const path = require('path');
const { minecraftServerRoot, minecraftServerJarFile } = require('./constants');

function startMinecraftServer() {
  /* The essential option is -nojline! Messes with the stdin, with the option
  we can pipe in input like "reload" */
  const minecraftServer =
      spawn('java', ['-Xms512M', '-Xmx1G', '-jar', minecraftServerJarFile, '-nojline'], {
      	cwd: minecraftServerRoot,
      });

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
