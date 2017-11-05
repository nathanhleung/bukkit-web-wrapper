const logger = require("./logger");
const createTables = require("./db/create-tables");
const migrateUsers = require("./db/migrate-users");

createTables(() => {
  migrateUsers(() => {
    logger.info("Finished setup!");
    // Exit after finishing
    process.exit(0);
  });
});
