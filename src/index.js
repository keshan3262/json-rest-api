require('./configure');

const cors = require('cors');
const express = require('express');
const { logger, pinoHttpLogger } = require('./utils/logger');
const { PORT } = require('./utils/env');

const app = express();
app.use(express.json());
app.use(pinoHttpLogger);
app.use(cors());

async function setupServer() {
  app.get('/', (_, res) => res.status(200).json({ message: 'Hello, world!' }));

  app.listen(PORT, () => logger.info(`Server is running on port ${PORT}...`));
}

(async () => {
  try {
    await setupServer();
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
