const fsAsync = require('fs/promises');
const path = require('path');

const storageDir = path.join(__dirname, '../../storage');

const clearStorage = async () => {
  const files = await fsAsync.readdir(storageDir);
  await Promise.all(files.map(file => fsAsync.unlink(path.join(storageDir, file))));
};

const expectStorageFileContent = async (expectedContent, filename) => {
  const chai = await import('chai');
  const content = JSON.parse(await fsAsync.readFile(path.join(storageDir, filename), 'utf-8'));
  chai.expect(content).to.deep.equal(expectedContent);
};

const expectFileExistence = async (filename, exists) => {
  const chai = await import('chai');
  const fileExists = await fsAsync.access(path.join(storageDir, filename)).then(() => true).catch(() => false);
  chai.expect(fileExists).to.equal(exists);
};

const writeFile = async (filename, content) => {
  await fsAsync.writeFile(path.join(storageDir, filename), JSON.stringify(content));
};

module.exports = { clearStorage, expectStorageFileContent, expectFileExistence, writeFile };