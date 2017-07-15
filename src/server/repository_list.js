import config from './config';
import { broadcast } from './socket';
import Repository from './repository';

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

    let directory = config.repositories[name].path;
    let repo = new Repository({name, directory});

    repo.on('update', e => broadcast(e));

    list.push(repo);
  });
}


export function getRepo(assetPath) {
  let repoName = assetPath.match(/[/](.+?)[./]/)[1];
  return list.find(r => r.name === repoName);
}


// XXX THIS IS TERRIBLE
export function getFileList() {
  return list.reduce((list,r) => {
    list[r.name] = r.toJSON()
    return list;
  }, {});
}


