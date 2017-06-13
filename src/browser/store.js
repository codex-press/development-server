import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'

import saga from './sagas'
import reducer from './reducers';
import DevTools from './components/DevTools';
import * as env from './env'
import * as actions from './actions'

const sagaMiddleware = createSagaMiddleware();

var store;
export { store as default };

if (env.development) {
  store = createStore(
    reducer,
    compose(
      applyMiddleware(sagaMiddleware),
      DevTools.instrument(),
    ),
  );
}
else {
  store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware),
  );
}

sagaMiddleware.run(saga);

