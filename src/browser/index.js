import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';

import deepForceUpdate from 'react-deep-force-update';

import store from './store';
import * as actions from './actions';
import App from './components/App';
import Root from './components/Root';

import './index.less';

let root = document.querySelector('#dev-server');

if (root.attachShadow)
  root = root.attachShadow({mode: 'open'});

const render = () => ReactDOM.render(
  <Root>
    <App />
    <div id="styles-container" />
  </Root>,
  root,
  moveStyles
);

render();

if (module.hot) module.hot.accept('./components/App', render);

store.dispatch(actions.initialize());

let dispatch = action => () => store.dispatch(action());
window.addEventListener('focus',  dispatch(actions.focus));
window.addEventListener('blur', dispatch(actions.blur));
window.addEventListener('beforeunload', dispatch(actions.saveState));


// annoying but the styles are added before the page is loaded so
function moveStyles() {
  document.querySelectorAll('.webpack-styles').forEach(style => {
    root.querySelector('#styles-container').appendChild(style)
  });
}
