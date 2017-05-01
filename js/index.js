import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'

import renderArticle from './article';
import Socket from './socket';

import DevTools from './componenents/DevTools';
import App from './componenents/App';

import { isLocalhost } from './utility';
import { rootReducer } from './reducers';

import {
  setArticle,
  saveState,
  restoreState,
  loadConfig,
  loadAccount,
  setInvalidToken,
  receiveRepositories
} from './actions';




export var store = createStore(
  rootReducer,
  compose(
    applyMiddleware(thunkMiddleware),
    DevTools.instrument(),
  ),
);


export function getKey() {
  return store.getState().getIn(['config','token']);
}

// restore some state from session storage; save before closing the window
store.dispatch(restoreState());
window.addEventListener('beforeunload', () => store.dispatch(saveState()));

// Load configuration items like API access token from the user's saved settings
store.dispatch(loadConfig())
.then(() => {

  // load the account information if we have an API key
  if (store.getState().getIn(['config','token']))
    store.dispatch(loadAccount())
  else
    store.dispatch(setInvalidToken(true))

  // socket provides data on repository list on intial connect
  let socket = new Socket(
    repositories => store.dispatch(receiveRepositories(repositories))
  );

  socket.connect()
  // continuing the waterfall... once we have the repositories, we can load 
  // the article json. This uses the api key if present
  .then(repositories => renderArticle(repositories))
  .then(articleAttrs => store.dispatch(setArticle(articleAttrs)));

});


// renders the App component inside a Shadown DOM
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



