const pino = require('pino');
const path = require('path');

const logPath = path.join(__dirname, '..', '..', '..', 'logs', 'app.log');

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { destination: logPath },
    },
    {
      target: 'pino/file', // logs to the standard output by default
    },
  ],
});

module.exports = pino(
  {
    level: process.env.PINO_LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport
);
