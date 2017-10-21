const path = require('path');

const minecraftServerRoot = path.join(__dirname, '..', 'Bukkit Server');

module.exports = {
  minecraftServerRoot,
  permissionsDataFile:
    path.join(minecraftServerRoot, 'plugins', 'PermissionsEx', 'permissions.yml'),
  userDataFile:
    path.join(__dirname, 'data', 'users.json'),
  minecraftServerJarFile:
    path.join(minecraftServerRoot, 'craftbukkit-1.5.2-R1.0.jar'),
};
