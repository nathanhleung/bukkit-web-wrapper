const createTables = require("./db/create-tables");
const migrateUsers = require('./migrate-users');

createTables(() => {
  migrateUsers(() => {
    // Exit after finishing
    process.exit(0);
  });
});
