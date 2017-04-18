import express from 'express';
import bodyParser from 'body-parser';
import config, { writeConfig } from './config';

var router = express.Router();
export {router as default};

router.use(bodyParser.json());

router.post('/config', (req, res) => {
  writeConfig(req.body);
  res.json(config);
});

router.get('/config', (req, res) => {
  res.json(config);
});


