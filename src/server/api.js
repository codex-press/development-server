import os from 'os';
import fsp from 'fs-promise';
import express from 'express';
import bodyParser from 'body-parser';
import open from 'open';

import config, { writeConfig } from './config';
import repos, { updateRepositories } from './repository_list';
import { isLocalhost } from './utility';

var router = express.Router();
export {router as default};

router.use(bodyParser.json());



router.get('/repositories', async (req, res) => {
  await Promise.all(repos.map(r => r.ready));
  res.send(repos.map(r => r.toJSON()));
});



// All following requests must be from localhost
let message = `For security, the Codex Development Server only accepts \
requests from localhost.`;

router.use((req, res, next) => {
  isLocalhost(req) ?  next() : res.status(403).send(message);
});



router.get('/config', (req, res) => res.json(config));
router.post('/config', (req, res) => {
  writeConfig(req.body);
  res.json(config);
  updateRepositories();
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





