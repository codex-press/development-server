import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'

import { rootReducer } from './reducers';
import { setArticle, saveState, restoreState, loadConfig } from './actions';

import renderArticle from './article';
import Socket from './socket';
import DevTools from './componenents/DevTools';
import App from './componenents/App';



export var store = createStore(
  rootReducer,
  compose(
    applyMiddleware(thunkMiddleware),
    DevTools.instrument(),
  ),
);



// Load configuration items like API token from the user's saved settings
store.dispatch(loadConfig());



// socket provides data on repository list on intial connect
let socket = new Socket();

socket.connect()
.then(fileList => renderArticle(fileList))
.then(articleAttrs => store.dispatch(setArticle(articleAttrs)));



// restore some state from session storage; save before closing the window
store.dispatch(restoreState());
window.addEventListener('beforeunload', () => store.dispatch(saveState()));



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



