import { addStylesheet } from '../utility'


export default async function renderArticle(data, repositories) {
  addStylesheet('/app/index.css');

  const [ app, render ] = await Promise.all([
    CodexLoader.import('/app/index.js'),
    CodexLoader.import('/render/index.js'),
  ]);

  const addOne = path => {
    let repoName = path.match(/\/([^/]*)/)[1];
    let prefix = '/' + repoName + '/';

    let repo = Object.keys(repositories).find(name => name === repoName);

    if (!repo || repositories[repo].assets.includes(path)) {
      console.log('adding asset: ', path);
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

  // get the ones that aren't in the repos
  // data.asset_data.forEach(({path}) => {
  //   console.log(path);
  //   if (/\.js$/.test(path))
  //     CodexLoader.import(path);
  //   else
  //     addStylesheet(path)
  // });

  app.article.set(data);
  document.documentElement.classList.add('javascript','focus');
  app.article.tick();
  return data;
}



//     // JS update checks if it's in this frame then reloads
//     if (path.match(/js$/)) { 
//       let selector = `script[src^="https://localhost:8000/${path}"]`;
//       // external asset
//       if (dom.first(document, selector))
//         location.reload();
//     }
//     // CSS update does a hot reload
//     else if (path.match(/css$/)) {
//       let selector = `link[href^="https://localhost:8000/${path}"]`;
//       let tag = dom.first(document, selector)

//       if (tag) {
//         log.info('update: ', path);

//         // onload doesn't work the second time so must replace the tag
//         let href = `https://localhost:8000/${path}?` + Date.now();
//         let el = dom.create(`<link rel=stylesheet href="${href}">`)
//         el.onload = () => article.resize();
//         dom(tag).insertAfter(el).remove();
//       }
//     }

