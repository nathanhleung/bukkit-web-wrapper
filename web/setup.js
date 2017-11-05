const createTables = require("./db/create-tables");

createTables(() => {
  // Exit after finishing
  process.exit(0);
});
