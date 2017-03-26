import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import Config from './config';

import { Map } from 'immutable';

import Socket from './socket';


// websocket to server
new Socket();


let initialState = Map({
  token: 'meh',
  repo_path: 'meh',
});

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_TOKEN':
      return state.set('token', action.value);
    case 'SET_REPO_PATH':
      return state.set('repo_path', action.value);
    case 'SYNC':
      sync();
      return state;
    default:
      return state;
  }
}

let store = createStore(reducer)

store.subscribe(() => console.log(store.getState().toJSON()))


function sync() {
  console.log(JSON.stringify(store.getState()));
  fetch('/api/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(store.getState()),
  })
  .then(response => response.json())
  .then(data => console.log(data))
}




function start() {

  let el = document.querySelector('#config');

  if (el.attachShadow)
    el = el.attachShadow({mode: 'open'})

  ReactDOM.render(
    <Provider store={store}>
      <Config />
    </Provider>,
    el
  );
}

if (document.readyState === 'loading')
  window.addEventListener('DOMContentLoaded', start);
else
  start();


