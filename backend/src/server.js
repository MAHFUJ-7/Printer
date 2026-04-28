const app = require("./app");
const env = require("./config/env");
const prisma = require("./config/prisma");
const redis = require("./config/redis");
const logger = require("./utils/logger");

const server = app.listen(env.port, () => {
  logger.info(`CampusPrint API listening on port ${env.port}`);
});

async function shutdown(signal) {
  logger.info(`Received ${signal}. Closing server gracefully.`);
  server.close(async () => {
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
