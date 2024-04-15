require('./configure');

const cors = require('cors');
const express = require('express');

const fsAsync = require('fs/promises');
const path = require('path');

const { logger, pinoHttpLogger } = require('./utils/logger');
const { PORT } = require('./utils/env');
const { jsonFilenameValidationHandlers } = require('./utils/validation');
const { withNonExistentFile, withExistentFile } = require('./utils/fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttpLogger);
app.use(cors());

async function setupServer() {
  const storagePath = path.join(__dirname, '../storage');
  try {
    await fsAsync.readdir(storagePath);
  } catch (e) {
    if (e.code === 'ENOTDIR') {
      logger.error('Storage path is a file, removing it...');
      await fsAsync.rm(storagePath);
    }

    logger.info('Creating storage directory...');
    await fsAsync.mkdir(storagePath);
  }

  app.post(
    '/create/:filename',
    ...jsonFilenameValidationHandlers,
    withNonExistentFile(
      req => path.join(storagePath, req.params.filename),
      async (req, res) => {
        await fsAsync.writeFile(path.join(storagePath, req.params.filename), JSON.stringify(req.body), 'utf-8');

        res.status(201).send({ message: 'File created' });
      }
    )
  );

  app.get('/list', async (_, res) => {
    try {
      const files = await fsAsync.readdir(storagePath);
      res.send(files);
    } catch (e) {
      logger.error(e);
      res.status(500).send({ error: 'Internal server error' });
    }
  });

  app.get(
    '/read/:filename',
    ...jsonFilenameValidationHandlers,
    withExistentFile(
      req => path.join(storagePath, req.params.filename),
      async (_req, res, _next, handler) => {
        const content = await fsAsync.readFile(handler, 'utf-8');
        res.send(JSON.parse(content));
      },
      true
    )
  );

  app.put(
    '/update/:filename',
    ...jsonFilenameValidationHandlers,
    withExistentFile(
      req => path.join(storagePath, req.params.filename),
      async (req, res, _next, handler) => {
        await fsAsync.writeFile(handler, JSON.stringify(req.body), 'utf-8');
        res.send({ message: 'File updated' });
      },
      false
    )
  );

  app.delete(
    '/delete/:filename',
    ...jsonFilenameValidationHandlers,
    async (req, res) => {
      const filePath = path.join(storagePath, req.params.filename);
      try {
        await fsAsync.unlink(filePath);
        res.send({ message: 'File deleted' });
      } catch (e) {
        if (e.code === 'ENOENT') {
          return res.status(404).json({ error: 'File not found' });
        }

        logger.error(e);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

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
