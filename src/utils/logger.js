const pino = require('pino');
const pinoHttp = require('pino-http');

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      debug: process.env.NODE_ENV === 'development'
    }
  },
  level: 'info'
});

const PINO_LOGGER = {
  logger: logger.child({ name: 'web' }),
  serializers: {
    req: req => ({
      method: req.method,
      url: req.url,
      body: req.body,
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
      id: req.id
    }),
    err: err => {
      const { type, message } = pino.stdSerializers.err(err);

      return { type, message };
    },
    res: res => ({
      statusCode: res.statusCode
    })
  }
};

const pinoHttpLogger = pinoHttp(PINO_LOGGER);

module.exports = { logger, pinoHttpLogger };
