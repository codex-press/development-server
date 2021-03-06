import os from 'os';
import fs from 'mz/fs';
import express from 'express';
import bodyParser from 'body-parser';
import open from 'open';

import config, { writeConfig } from './config';
import repos, { updateRepositories } from './repository_collection';
import { isLocalhost } from './utility';

var router = express.Router();
export {router as default};

router.use(bodyParser.json());


router.get('/repositories', async (req, res) => {
  await Promise.all(repos.map(r => r.ready));
  res.send(repos.map(r => r.toJSON()));
});


router.get('/config', (req, res) => {
  isLocalhost(req) ? res.json(config) : res.json({ ...config, token: null });
});


// All following requests must be from localhost
let message = `For security, the Codex Development Server only accepts \
requests from localhost.`;

router.use((req, res, next) => {
  isLocalhost(req) ? next() : res.status(403).send(message);
});



router.post('/config', (req, res) => {
  writeConfig(req.body);
  res.json(config);
  updateRepositories();
});


router.post('/path', async (req, res) => {
  try {
    let stats = await fs.stat(`${ req.body.path }/.git`)
    res.send(stats.isDirectory() ? 'true' : 'false')
  }
  catch (error) {
    res.send('false');
  }
});



router.post('/open', (req, res) => {
  open(req.query.path);
  res.send('"ok"');
});





