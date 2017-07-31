import path from 'path';
import os from 'os';
import request from 'supertest';
import cheerio from 'cheerio';


import app, { port, listening } from './app';
import * as env from './env';
import config from './config';
import repos from './repository_collection.js';



test('/repositories', async () => {
  expect.assertions(2);
  const res = await request(app).get('/api/repositories')
  expect(res.status).toBe(200);
  expect(res.body).toEqual(repos.map(r => r.toJSON()));
});



test('/config', async () => {
  expect.assertions(2);
  const res = await request(app).get('/api/config')
  expect(res.status).toBe(200);
  expect(res.body).toEqual(config);
});



test('/config from foreign host does not return token', async () => {
  const ip = os.networkInterfaces()['en0'][1].address
  await listening
  const origin = 'http://' + ip + ':' + port
  const res = await request(origin).get('/api/config')

  const expected = { ...config, token: null }

  expect(res.status).toBe(200);
  expect(res.body).toEqual(expected);
});



test('/path returns true', async () => {
  expect.assertions(2);
  const res = await request(app).post('/api/path').send({
    path: path.join(__dirname, '../..') 
  })
  expect(res.status).toBe(200)
  expect(res.text).toEqual('true')
});



test('/path returns false', async () => {
  expect.assertions(2);
  const res = await request(app).post('/api/path').send({
    path: '/some/made/up/path'
  })
  expect(res.status).toBe(200)
  expect(res.text).toEqual('false')
});



test('post to /open from foreign host is not found', async () => {
  const ip = os.networkInterfaces()['en0'][1].address
  await listening
  const origin = 'http://' + ip + ':' + port
  const res = await request(origin).post('/api/open')

  expect(res.status).toBe(403);
});



