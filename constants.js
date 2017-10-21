const path = require('path');

module.exports = {
  permissionsDataFile:
    path.join(__dirname, '..', 'Bukkit Server', 'plugins', 'PermissionsEx', 'permissions.yml'),
  userDataFile:
    path.join(__dirname, 'data', 'users.json'),
  serverStartScriptFile:
    path.join(__dirname, '..', 'Bukkit Server', 'start-server.bat'),
};
