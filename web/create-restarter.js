const { scheduleJob } = require("node-schedule");

function createRestarter(minecraftServer) {
  // Stop server every 2 hours
  // This will end the whole process (including web),
  // and then forever will restart.
  return scheduleJob("0 */2 * * *", () => {
    minecraftServer.stdin.write(
      `say To ensure server stability, the server will restart in 5 minutes.\n`
    );
    setTimeout(() => {
      minecraftServer.stdin.write(
        `say To ensure server stability, the server will restart in 1 minute.\n`
      );
    }, 1000 * 60 * 4);
    setTimeout(() => {
      minecraftServer.stdin.write(`stop\n`);
    }, 1000 * 60 * 5);
  });
}

module.exports = createRestarter;
