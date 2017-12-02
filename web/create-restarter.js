const { scheduleJob } = require("node-schedule");

function createRestarter(minecraftServer) {
  // Stop server every 2 hours
  // This will end the whole process (including web),
  // and then forever will restart.
  return scheduleJob("0 */2 * * *", () => {
    minecraftServer.stdin.write(`stop\n`);
  });
}

module.exports = createRestarter;
