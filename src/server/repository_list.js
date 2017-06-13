import chokidar from 'chokidar';

import config from './config';
import { broadcast } from './socket';
import Repository from './repository';

let publicWatcher = chokidar.watch(['./build/main.js', './build/main.css'])
.on('change', name => broadcast({publicUpdate: name}));


var list = [];
export {list as default};


export function updateRepoList() {
  let names = Object.keys(config.repositories);

  list = list.reduce((list, r) => {

    let isRemoved = !names.find(n => {
      return r.name === n && r.path === config.repositories[n].path;
    });

    isRemoved ? r.close() : list.push(r);

    return list;
  }, []);

  names.forEach(name => {
    if (list.find(r => r.name === name))
      return;

    let path = config.repositories[name].path;
    let repo = new Repository({name, path});

    repo.on('update', e => broadcast(e));

    list.push(repo);
  });
}


export function getRepo(assetPath) {
  let repoName = assetPath.match(/(.+?)[./]/)[1];
  return list.find(r => r.name === repoName);
}


export function getFileList() {
  return list.reduce((list,r) => {
    list[r.name] = {external: r.external, inline: r.inline, files: r.files};
    return list;
  }, {});
}


