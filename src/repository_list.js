import config from './config';
import { broadcast } from './socket';
import Repository from './repository';

var list = [];
export {list as default};

if (true || config.development)
  makeRepo('public', './public');

// let fx = makeRepo('fx', '/Users/omar/code/codex_press/fx');
// fx.on('ready', () => console.log('hiya', fx.inlineAssets));

let parent = makeRepo('parent', '/Users/omar/code/codex_press/parent');
//parent.on('ready', () => console.log('hiya', parent.assets));


function makeRepo(name, path) {
  let repo = new Repository({name, path});

  repo.on('update', e => {
    // console.log(`--${ e.type }: ${ e.filename }`);
    broadcast(e.filename);
  });

  list.push(repo);

  return repo;
}


export function getRepo(assetPath) {
  let repoName = assetPath.match(/(.+?)[./]/)[1];
  return list.find(r => r.name === repoName);
}


