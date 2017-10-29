const { spawn } = require("child_process");
const path = require("path");
const { minecraftServerRoot, minecraftServerJarFile } = require("./constants");
const logger = require("./logger");

function startMinecraftServer() {
  const serverArgs = [
    "-Xms1G",
    "-Xmx1G",
    "-jar",
    minecraftServerJarFile,
    "-nojline"
  ];

  // If MINECRAFT_PORT is an explicitly set environment
  // variable, override the default port setting
  // (set in bukkit/server.properties)
  if (process.env.MINECRAFT_PORT) {
    serverArgs.push('-p');
    serverArgs.push(process.env.MINECRAFT_PORT);
  }

  /* The essential option is -nojline! Messes with the stdin, with the option
  we can pipe in input like "reload" */
  // Make sure 64-bit Java is installed, if not, max ram is 1G (not 3G)
  const minecraftServer = spawn("java", serverArgs, {
    cwd: minecraftServerRoot
  });

  minecraftServer.stdout.on("data", data => {
    logger.info(data.toString());
  });

  minecraftServer.stderr.on("data", data => {
    logger.info(data.toString());
  });

  minecraftServer.on("exit", code => {
    logger.info(`Minecraft Server exited with code ${code}`);
  });

  return minecraftServer;
}

// Export singleton for use across entire app
module.exports = startMinecraftServer();
