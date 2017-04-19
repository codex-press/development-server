import { contentOrigin } from './env';
import { addScript, addStylesheet } from './helpers'

export default function renderArticle(fileList) {

  return fetch(`${contentOrigin}${location.pathname}.json?full`)
  .then(response => response.json())
  .then(data => {

    data.asset_data.forEach(d => {
      let repo = d.asset_path.match(RegExp('(.*?)[./]'))[1];

      if (fileList[repo])
        d.digest_path = d.asset_path;
      else
        d.digest_path = contentOrigin + '/' + d.digest_path;
    });

    // XXX use the data for digest paths here
    addStylesheet(contentOrigin + '/app.css')

    return addScript(contentOrigin + '/app/core.js')
    .then(() => addScript(contentOrigin + '/app.js'))
    .then(() => addScript(contentOrigin + '/render.js'))
    .then(() => {

      let article = require('article').default;
      article.set(data);
      document.documentElement.classList.add('javascript','focus');
      article.tick();
      return data;
    });
  });

};


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

