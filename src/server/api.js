import os from 'os';
import fsp from 'fs-promise';
import express from 'express';
import bodyParser from 'body-parser';
import open from 'open';

import config, { writeConfig } from './config';
import repos, { updateRepoList } from './repository_list';
import { isLocalhost } from './utility';

var router = express.Router();
export {router as default};

router.use(bodyParser.json());

router.get('/config', (req, res) => {
  res.json({ ...config});
});

// All following requests must be from localhost
let message = `For security, the Codex Development Server only accepts \
requests from localhost.`;

router.get('/repositories', async (req, res) => {
  await Promise.all(repos.map(r => r.ready));
  res.send(repos.map(r => r.toJSON()));
});

router.use((req, res, next) => {
  isLocalhost(req) ?  next() : res.status(403).send(message);
});

router.post('/config', (req, res) => {
  writeConfig(req.body);
  updateRepoList();
  res.json(config);
});

router.get('/path', async (req, res) => {
  try {
    let stats = await fsp.stat(`${req.query.path}/.git`)
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





