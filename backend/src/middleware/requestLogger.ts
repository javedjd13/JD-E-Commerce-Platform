const morgan = require('morgan');
const logger = require('../config/logger');

module.exports = morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
});

export {};
