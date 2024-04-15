const request = require('supertest');

const { app, setupPromise } = require('../index');
const { clearStorage, assertStorageFileContent, expectFileExistence, writeFile } = require('../utils/test');

describe('API tests', () => {
  before(async () => {
    await Promise.all([clearStorage(), setupPromise]);
  });

  describe('POST /create/:filename', () => {
    it('should create a file', async () => {
      const res = await request(app)
        .post('/create/test1.json')
        .send({ test: 'test' })
        .expect(201)
        .expect({ message: 'File created' });

      await assertStorageFileContent({ test: 'test' }, 'test1.json');
    });

    it('should return 400 if filename is invalid', async () => {
      await request(app)
        .post('/create/test1')
        .send({ test: 'test' })
        .expect(400);
      
      await expectFileExistence('test1', false);
    });

    it('should return 409 if file already exists', async () => {
      await request(app)
        .post('/create/test2.json')
        .send({ test: 'test' })
        .expect(201);
      await request(app)
        .post('/create/test2.json')
        .send({ test: 'newTest' })
        .expect(409);

      await assertStorageFileContent({ test: 'test' }, 'test2.json');
    });
  });

  describe('GET /list', () => {
    before(clearStorage);

    it('should list files', async () => {
      await request(app)
        .get('/list')
        .expect(200)
        .expect([]);

      const filesNames = ['test3.json', 'test4.json'];
      await Promise.all(filesNames.map(async filename => writeFile(filename, { test: 'test' })));

      await request(app)
        .get('/list')
        .expect(200)
        .expect(filesNames);
    });

    after(clearStorage);
  });

  describe('GET /read/:filename', () => {
    before(async () => writeFile('test5.json', { test: 'test' }));

    it('should read an existent file', async () => {
      await request(app)
        .get('/read/test5.json')
        .expect(200)
        .expect({ test: 'test' });
    });

    it('should return 404 if file does not exist', async () => {
      await request(app)
        .get('/read/test6.json')
        .expect(404);
    });

    it('should return 400 if filename is invalid', async () => {
      await request(app)
        .get('/read/test6')
        .expect(400);
    });
  });

  describe('PUT /update/:filename', () => {
    before(async () => writeFile('test7.json', { test: 'test' }));

    it('should update an existent file', async () => {
      await request(app)
        .put('/update/test7.json')
        .send({ test: 'newTest' })
        .expect(200)
        .expect({ message: 'File updated' });

      await assertStorageFileContent({ test: 'newTest' }, 'test7.json');
    });

    it('should return 404 if file does not exist', async () => {
      await request(app)
        .put('/update/test8.json')
        .send({ test: 'test' })
        .expect(404);
    });

    it('should return 400 if filename is invalid', async () => {
      await request(app)
        .put('/update/test8')
        .send({ test: 'test' })
        .expect(400);
    });
  });

  describe('DELETE /delete/:filename', () => {
    before(async () => writeFile('test9.json', { test: 'test' }));

    it('should delete an existent file', async () => {
      await request(app)
        .delete('/delete/test9.json')
        .expect(200)
        .expect({ message: 'File deleted' });

      await expectFileExistence('test9.json', false);
    });

    it('should return 404 if file does not exist', async () => {
      await request(app)
        .delete('/delete/test10.json')
        .expect(404);
    });

    it('should return 400 if filename is invalid', async () => {
      await request(app)
        .delete('/delete/test10')
        .expect(400);
    });
  });

  after(clearStorage);
});
