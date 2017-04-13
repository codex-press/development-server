import {getFilename} from './filesystem';

export default (req, res, next) => {

  getFilename(req.path)
  .then(filename => {
    if (filename)
      res.sendFile(filename);
    else
      next();
  })
  .catch(err => next());

};

