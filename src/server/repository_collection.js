import tableFactory from 'terminal-table-output'
import pad from 'pad'

import config from './config'
import { broadcast } from './socket'
import Repository from './repository'
import * as log from './log'


var list = [];
export { list as default };


export function getRepo(assetPath) {
  let repoName = assetPath.match(/[/](.+?)[./]/)[1];
  return list.find(r => r.name === repoName);
}


export function updateRepositories() {
  let names = Object.keys(config.repositories);

  list = list.reduce((list, r) => {

    let isRemoved = !names.find(n => {
      return r.name === n && r.dir === config.repositories[n].path;
    });

    // this close() is verrrrryyyy slow, like sometimes more than 10 seconds.
    // so we just delay in hopes that it doesnt interrupt
    if (isRemoved)
      setTimeout(() => r.close(), 1000);
    else
      list.push(r);

    return list;
  }, []);

  names.forEach(name => {
    if (list.find(r => r.name === name))
      return;

    let directory = config.repositories[name].path;
    let repo = new Repository({ name, directory });

    repo.on('message', e => broadcast(e));

    setTimeout(async () => {
      await repo.ready;
      printFiles(repo);
    });

    list.push(repo);
  });

}


export async function printRepositories() {
  await Promise.all(list.map(r => r.ready));
  list.forEach(printFiles);
}

function printFiles(repo) {
  log.info('\nRepository: ', repo.name);
  log.info('Directory: ', repo.dir);

  const table = tableFactory.create()
    .line()
    .pushrow(['| Filename', 'Path'])
    .line()

  const cols = process.stdout.columns / 2 - 3;

  repo.toJSON().files.forEach(f => {
    table.pushrow([
      ('| ' + pad(f.filename, cols - 2)).slice(0, cols),
      pad(f.path || '', cols).slice(0, cols)
    ])
  });

  log.info(table.line().print());

}


