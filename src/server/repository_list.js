import tableFactory from 'terminal-table-output';
import pad from 'pad';

import config from './config';
import { broadcast } from './socket';
import Repository from './repository';
import * as log from './log';


var list = [];
export {list as default};


export function getRepo(assetPath) {
  let repoName = assetPath.match(/[/](.+?)[./]/)[1];
  return list.find(r => r.name === repoName);
}


export async function updateRepoList() {
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

    let directory = config.repositories[name].path;
    let repo = new Repository({ name, directory });
    
    repo.on('message', e => broadcast(e));

    list.push(repo);
  });

  await Promise.all(list.map(r => r.ready));

  list.forEach(printFiles);
}


function printFiles(repo) {
  log.info('Repository: ', repo.name);
  log.info('Directory: ', repo.dir);

  const table = tableFactory.create()
    .line()
    .pushrow(['| Filename', 'Path'])
    .line()

  repo.toJSON().files.forEach(f => {
    table.pushrow([
      ('| ' + pad(f.filename, 35)).slice(0, 37),
      pad(f.path || '', 37).slice(0, 37)
    ])
  });

  log.info(table.line().print());

}


