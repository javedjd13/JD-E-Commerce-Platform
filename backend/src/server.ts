const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { pool } = require('./database/db');

const server = app.listen(env.port, () => {
  logger.info(`API listening on port ${env.port}`);
});

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { };
