import chokidar from 'chokidar';

import {broadcast} from './socket';

let watcher = chokidar.watch('./public');

watcher.on('all', (event, filename) => {
  broadcast(filename);
});


