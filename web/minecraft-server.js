/**
 * Minecraft Server
 *
 * Starts the craftbukkit jar
 * and exports the created
 * instance. Also logs
 * craftbukkit messages
 * using the logger.
 */

const { spawn } = require("child_process");
const path = require("path");
const { minecraftServerRoot, minecraftServerJarFile } = require("./constants");
const logger = require("./logger");

/**
 * Starts the Bukkit minecraft server
 * @return the created server instance
 */
function startMinecraftServer() {
  const serverArgs = [
    // Server is hosted on an AWS instance with a max of
    // 1 GB of RAM
    // Note: if instance is upgraded, make sure 64-bit Java
    // is installed, because 1GB is the max allocation
    // for 32-bit Java
    "-Xms512M", // starting memory allocation is 512 MB
    "-Xmx800M", // maximum memory allocation is 800 MB
    "-jar",
    minecraftServerJarFile,
    // -nojline is very important.
    // Without this option piping input to stdin
    // doesn't work.
    "-nojline"
  ];

  // If MINECRAFT_PORT is an explicitly set environment
  // variable, override the default port setting
  // (set in bukkit/server.properties)
  if (process.env.MINECRAFT_PORT) {
    serverArgs.push("-p");
    serverArgs.push(process.env.MINECRAFT_PORT);
  }

  const minecraftServer = spawn("java", serverArgs, {
    // If this isn't set to the Minecraft server root,
    // Bukkit acts as if the web/ folder is the
    // server root and creates a whole bunch of
    // world files
    cwd: minecraftServerRoot
  });

  // Log server messages using custom logger
  minecraftServer.stdout.on("data", data => {
    // Log line by line
    const lines = data.toString().split("\n");
    lines.forEach(line => {
      // Each Bukkit message starts with a date,
      // followed by a severity tag surrounded
      // by square brackets
      // However, the timestamp is already being saved
      // separately, so we can remove it
      const msgStart = line.indexOf("[");
      logger.info(line.substring(msgStart));
    });
  });

  minecraftServer.stderr.on("data", data => {
    const lines = data.toString().split("\n");
    lines.forEach(line => {
      const msgStart = line.indexOf("[");
      // Bukkit sends info messages to stderr for some reason,
      // so just log as info
      logger.info(line.substring(msgStart));
    });
  });

  minecraftServer.on("exit", code => {
    logger.info(`Minecraft Server exited with code ${code}`);
  });

  return minecraftServer;
}

// Export singleton for use across entire app
module.exports = startMinecraftServer();
