import { addStylesheet, addScript } from '../utility'


var renderer;

export default async function renderArticle(data, repositories) {

  addStylesheet('/app/index.css');

  const [ app, { default: ClientRenderer } ] = await Promise.all([
    CodexLoader.import('/app/index.js'),
    CodexLoader.import('/render/src/client.js'),
  ]);

  renderer = new ClientRenderer();

  const addOne = path => {
    let repoName = path.match(/\/([^/]*)/)[1];
    let prefix = '/' + repoName + '/';

    let repo = repositories.find(r => r.name === repoName);

    if (!repo || repo.assets.includes(path)) {
      // console.log('adding asset: ', path);
      if (/\.js$/.test(path))
        CodexLoader.import(path);
      else if (/\.css$/.test(path))
        addStylesheet(path);
    }
  }

  data.assets.forEach(path => {
    if (path[0] !== '/')
      path = '/' + path;

    if (!/\.(js|css)$/.test(path)) {
      addOne(path + '.js');
      addOne(path + '.css');
    }
    else {
      addOne(path);
    }
  });

  // Tell the renderer about the development repos so it doesn't add
  // those links to the page
  data.development_repositories = repositories.map(r => r.name);

  // remove inline_assets that are in the dev repos. They will be loaded 
  // on demand
  data.inline_assets = data.inline_assets.filter(a => {
    const repoName = a.path.match(/\/([^/]*)/)[1];
    return !repositories.find(r => r.name === repoName);
  });

  if (data.header_path) {
    const repoName = data.header_path.match(/\/([^/]*)/)[1];
    if (repositories.find(r => r.name === repoName)) {
      const el = document.querySelector('body > header');
      replaceElementWithTemplate(el, data.header_path);
    }
  }

  if (data.footer_path) {
    const repoName = data.footer_path.match(/\/([^/]*)/)[1];
    if (repositories.find(r => r.name === repoName)) {
      const el = document.querySelector('body > footer');
      replaceElementWithTemplate(el, data.footer_path);
    }
  }

  renderer.set(data);
}


// returns true if it needs a reload
export function reloadAssetPaths(message, article) {
  // console.log(message.event, { message });

  if (/\.(svg|html)$/.test(message.filename)) {
    CodexLoader.import('/render/index.js')
    .then(render => {

      renderer.updateAsset(message.paths[0]);

      if (message.paths[0] === article.header_path) {
        replaceElementWithTemplate(
          document.querySelector('body > header'),
          article.header_path
        );
      }
      if (message.paths[0] === article.footer_path) {
        replaceElementWithTemplate(
          document.querySelector('body > footer'),
          article.footer_path
        );
      }

    });

    return false;
  }
  else if (message.filename.endsWith('.js')) {
    return true;

    // this doesn't work currently because the JS file could just be imported
    // from another one and we're not keeping track of JS dependencies yet so
    // they're not returned here
    let path = message.paths[0];
    let found = article.assets
      .map(a => a.startsWith('/') ? a : '/' + a)
      .find(a => a === path || a + '.js' === path);

    if (found)
      return true;

  }
  else if (message.paths[0].endsWith('.css')) {

    message.paths.forEach(p => {
      let existing = document.querySelector(`link[href^="${ p }"]`)

      if (message.event === 'remove') {
        if (existing)
          existing.remove();
        return;
      }

      const aplicable = article.assets
        .map(a => a.startsWith('/') ? a : '/' + a)
        .find(a => a === p || a + '.css' === p);

      if (!aplicable)
        return;

      const el = document.createElement('link');
      el.href = p + '?' + Date.now();
      el.rel = 'stylesheet';
      el.onload = () => window.dispatchEvent(new Event('resize'));

      if (message.event === 'add') {
        document.head.appendChild(el);
      }
      else if (message.event === 'change') {
        existing.parentNode.insertBefore(el, existing.nextElementSibling);
        existing.remove();
      }

    });
    
    return false;
  }

}


async function replaceElementWithTemplate(el, path) {
  try {
    const res = await fetch(path);
    if (res.ok)
      el.innerHTML = await res.text();
    else
      el.innerHTML = `Cannot load "${ path }": HTTP ${ res.status }`;
  }
  catch (error) {
    console.log(error);
  }
}




