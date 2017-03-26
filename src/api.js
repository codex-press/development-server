import express from 'express';
import bodyParser from 'body-parser';

import config from './config';


var api = express();
export {api as default};


api.use(bodyParser.json());

api.post('/config', (req, res) => {
  console.log(req.body);
  res.json(config);
});

api.get('/config', (req, res) => {
  res.json(config);
});


