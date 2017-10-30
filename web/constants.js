/**
 * Constants to be used across app
 * Generally the locations of important files
 */

const path = require("path");

// The root of the Minecraft server
const minecraftServerRoot = path.join(__dirname, "..", "bukkit");

module.exports = {
  minecraftServerRoot,
  // The location of the PermissionsEx permissions file
  // This file contains the user groups
  permissionsDataFile: path.join(
    minecraftServerRoot,
    "plugins",
    "PermissionsEx",
    "permissions.yml"
  ),
  essentialsUserDataDir: path.join(
    minecraftServerRoot,
    "plugins",
    "essentials",
    "userdata"
  ),
  // The location of the user "database"
  userDataFile: path.join(__dirname, "data", "users.json"),
  // The location of the actual Bukkit jar
  minecraftServerJarFile: path.join(
    minecraftServerRoot,
    "craftbukkit-1.5.2-R1.0.jar"
  ),
  // The location of the log file where Bukkit writes
  // messages to
  minecraftLogFile: path.join(minecraftServerRoot, "server.log")
};
