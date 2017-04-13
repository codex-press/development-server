import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { Map } from 'immutable';

import { rootReducer } from './reducers';

import Config from './componenents/Config';

import Socket from './socket';
import Cable from './cable';

// websocket to development server
new Socket();

// ActionCable for server API
// new Cable();


let initialState = Map({
  token: 'meh',
  repo_path: 'meh',
});


let store = createStore(rootReducer)

store.subscribe(() => console.log(store.getState().toJSON()))





function start() {

  let el = document.querySelector('#config');

  if (el.attachShadow)
    el = el.attachShadow({mode: 'open'})

  ReactDOM.render(
    <Provider store={ store }>
      <Config />
    </Provider>,
    el
  );

}

if (document.readyState === 'loading')
  window.addEventListener('DOMContentLoaded', start);
else
  start();


if (document.readyState === 'complete')
  window.addEventListener('load', loadStory);
else
  loadStory();


function loadStory() {
  let url = '/alice/chapter-1';

  fetch(`https://codex.press${url}.json?full`)
  .then(response => response.json())
  .then(data => {
    let article = require('article').default;
    article.set(data);
    //article.addState
  });

}


