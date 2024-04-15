const fsAsync = require('fs/promises');

/**
 * A factory for creating a handler that executes a function if a file from request does not exist. If it does,
 * it returns a 409 response. If an error occurs, it returns a 500 response.
 * @param {(req: import('express').Request) => string} pathFn
 * @param {(req: import('express').Request, res: import('express').Response, next: () => void) => Promise<void>} execFn
 */
const withNonExistentFile = (pathFn, execFn) => {
  return async (req, res, next) => {
    try {
      const filePath = pathFn(req);
      const handler = await fsAsync.open(filePath, 'r');
      await handler.close();
      throw new Error('File already exists');
    } catch (e) {
      if (e.code === 'ENOENT') {
        return execFn(req, res, next);
      }

      if (e.message === 'File already exists') {
        return res.status(409).json({ error: 'File already exists' });
      }

      console.error(e);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * A factory for creating a handler that executes a function if a file from request exists. If it does not,
 * it returns a 404 response. If an error occurs, it returns a 500 response.
 * @param {(req: import('express').Request) => string} pathFn
 * @param {(
 *   req: import('express').Request,
 *   res: import('express').Response,
 *   next: () => void, handler: import('fs/promises').FileHandle
 * ) => Promise<void>} execFn
 * @param {boolean} isRead Indicates whether the file should be opened for reading or writing
 */
const withExistentFile = (pathFn, execFn, isRead) => {
  return async (req, res, next) => {
    try {
      const filePath = pathFn(req);
      let handler = await fsAsync.open(filePath, 'r');
      if (!isRead) {
        handler.close();
        handler = await fsAsync.open(filePath, 'w');
      }
      await execFn(req, res, next, handler)
        .catch(e => {
          console.error(e);
          res.status(500).json({ error: 'Internal server error' });
        })
        .finally(() => handler.close());
    } catch (e) {
      if (e.code === 'ENOENT') {
        return res.status(404).json({ error: 'File not found' });
      }

      console.error(e);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = { withNonExistentFile, withExistentFile };
