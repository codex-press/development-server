import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';

import store from './store';
import * as actions from './actions';

import App from './app/App';
import Root from './app/Root';

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
  // styles must be added to shadow dom once this is mounted
  () => {
    const styles = Array.from(document.querySelectorAll('.webpack-styles'))
    styles.forEach(style => {
      root.querySelector('#styles-container').appendChild(style)
    });
  }
);


render();

if (module.hot)
  module.hot.accept('./app/App', render);

store.dispatch(actions.initialize())

let wrapDispatch = action => () => store.dispatch(action());
window.addEventListener('focus',  wrapDispatch(actions.focus));
window.addEventListener('blur', wrapDispatch(actions.blur));

