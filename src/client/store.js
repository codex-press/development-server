import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'

import reducer from './reducers';
import DevTools from './app/DevTools';
import * as env from './env'
import * as actions from './actions'

var store;
export { store as default };


if (env.development) {
  store = createStore(
    reducer,
    compose(
      applyMiddleware(thunkMiddleware),
      DevTools.instrument(),
    ),
  );
}
else {
  store = createStore(
    reducer,
    applyMiddleware(thunkMiddleware),
  );
}


