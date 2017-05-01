import os from 'os';

import express from 'express';
import bodyParser from 'body-parser';
import fsp from 'fs-promise';
import open from 'open';
import config, { writeConfig } from './config';
import repos, { updateRepoList, getFileList } from './repository_list';

import { isLocalhost } from './utility';

var router = express.Router();
export {router as default};

router.use(bodyParser.json());

// filter requests for localhost only
let message = `For security, the Codex Development Server only accepts \
requests from localhost.`;

router.get('/config', (req, res) => res.json(config));

router.use((req, res, next) => {
  isLocalhost(req) ?  next() : res.status(403).send(message);
});

router.post('/config', (req, res) => {
  writeConfig(req.body);
  updateRepoList();
  res.json(config);
});

router.get('/path', (req, res) => {
  if (req.query.path.indexOf(os.type() === 'Windows_NT' ? 'C:\\' : '/'))
    res.send('false');
  else
    fsp.stat(`${req.query.path}/.git`)
    .then(stats => res.send(stats.isDirectory() ? 'true' : 'false'))
    .catch(err => res.send('false'));
});


router.post('/open', (req, res) => {
  open(req.query.path);
  res.send('"ok"');
});


router.get('/repositories', (req, res) => {
  Promise.all(repos.map(r => r.ready))
  .then(() => res.send(getFileList()));
});


