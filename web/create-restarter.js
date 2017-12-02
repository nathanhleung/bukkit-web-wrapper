const { scheduleJob } = require("node-schedule");

function createRestarter(minecraftServer) {
  // Every day at 3AM stop the server
  // This will end the whole process (including web),
  // forever will restart.
  // Currently testing with every minute
  return scheduleJob("0 * * * * *" /* "0 3 * * *" */, () => {
    minecraftServer.stdin.write(`stop\n`);
  });
}

module.exports = createRestarter;
