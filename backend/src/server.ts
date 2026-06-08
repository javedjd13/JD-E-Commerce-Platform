const app = require("./app");
const env = require("./config/env");
const logger = require("./config/logger");
const { pool } = require("./database/db");
import prisma from "./lib/prisma";

const server = app.listen(env.port, () => {
  logger.info(`API listening on port ${env.port}`);
});

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    try {
      await Promise.all([pool.end(), prisma.$disconnect()]);
      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown", { error });
      process.exit(1);
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export {};
