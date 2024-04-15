const fsAsync = require('fs/promises');

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
