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
let app = makeRepo('app', '/Users/omar/code/codex_press/app');
let render = makeRepo('render', '/Users/omar/code/codex_press/render');
// let codex = makeRepo('codex', '/Users/omar/code/codex_press/codex');
// parent.on('ready', () => console.log('hiya', parent.assets));


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


export function getFileList() {
  return list.reduce((list,r) => {
    list[r.name] = {assets: r.assets, inlineAssets: r.inlineAssets};
    return list;
  }, {});
}


