import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'

import { rootReducer } from './reducers';

import Socket from './socket';
import DevTools from './componenents/DevTools';
import App from './componenents/App';

new Socket();

export var store = createStore(
  rootReducer,
  compose(
    applyMiddleware(thunkMiddleware),
    DevTools.instrument(),
  ),
);

window.s = store;

if (document.readyState === 'loading')
  window.addEventListener('DOMContentLoaded', start);
else
  start();


function start() {
  let el = document.querySelector('#dev-server');

  if (el.attachShadow)
    el = el.attachShadow({mode: 'open'})

  ReactDOM.render(
    <Provider store={ store }>
      <div>
        <DevTools />
        <App />
      </div>
    </Provider>,
    el
  );
}

