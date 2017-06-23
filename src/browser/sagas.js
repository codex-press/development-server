import { takeEvery, fork, take, put, call, select, race, all } from 'redux-saga/effects';
import { delay } from 'redux-saga'

import { api, devAPI } from './utility';
import * as actions from './actions';
import renderArticle from './article';
import Socket from './socket';
import { codexOrigin } from './env.js';

export default function* saga() {
  yield takeEvery(actions.INITIALIZE, initialize);
  yield takeEvery(actions.RESTORE_STATE, restoreState);
  yield takeEvery(actions.REQUEST_TOKEN, requestToken);
  yield takeEvery(actions.RECEIVE_TOKEN, receiveToken);
  yield takeEvery(actions.IMPERSONATE, impersonate);

  yield takeEvery(actions.ADD_ALERT, addAlert);

  yield takeEvery(actions.FETCH_CONFIG, fetchConfig);
  yield takeEvery(actions.FETCH_ACCOUNT, fetchAccount);
  yield takeEvery(actions.FETCH_ARTICLE, fetchArticle);
  yield takeEvery(actions.FETCH_DOMAINS, fetchDomains);
  yield takeEvery(actions.FETCH_USERS, fetchUsers);
  yield takeEvery(actions.FETCH_REPOSITORIES, fetchRepositories);

  yield takeEvery(actions.CHANGE_CONFIG, saveConfig);
  yield takeEvery(actions.ADD_REPOSITORY, repositoryUpdate);
  yield takeEvery(actions.REMOVE_REPOSITORY, repositoryUpdate);
  yield takeEvery(actions.CHANGE_REPOSITORY, repositoryUpdate);
}


export function* restoreState({state}) {
  if (state.ui.modal && state.ui.modal !== 'search')
    yield put(actions.toggleModal(state.ui.modal));

  let addAlerts = Object.keys(state.alerts).map(id => {
    return put(actions.addAlert(state.alerts[id]))
  });

  yield all(addAlerts);
}


export function* initialize() {

  // restore alerts and current modal from session storage
  if (window.sessionStorage.reduxState) {
    try {
      let state = JSON.parse(window.sessionStorage.reduxState)
      yield put(actions.restoreState(state));
    }
    catch (e) {
      window.sessionStorage.removeItem('reduxState');
      console.log(e);
    }
  }

  yield put(actions.fetchConfig());

  let config = (yield take(actions.RECEIVE_CONFIG)).data;

  if (!config.token) {
    yield put(actions.setTokenStatus('invalid'));
  }
  // load the account information if we have an API key
  else {
    yield put(actions.setTokenStatus('valid'));
    yield put(actions.fetchAccount());
    yield fork(listenToSocket);

    yield put(actions.fetchDomains());
    let domains = (yield take(actions.RECEIVE_DOMAINS)).data;
  }

  yield put(actions.fetchRepositories());
  let repositories = (yield take(actions.RECEIVE_REPOSITORIES)).data;

  yield put(actions.fetchArticle(location.pathname, config.domain));
  let article = (yield take(actions.RECEIVE_ARTICLE)).data;

  try {
    // yield call(renderArticle, article, repositories);
  }
  catch (e) {
    console.error('Article render error:', e);
  }
}


export function* requestToken({email, password}) {
  let body = { email, password };
  yield put(actions.setTokenStatus('pending'));
  try {
    let { token } = yield call(api, '/token', 'post', body, { auth: false })
    yield put(actions.receiveToken(token));
  }
  catch (error) {
    if (error.status === 423) {
      yield put(actions.setTokenStatus('locked'));
    }
    else {
      yield put(actions.setTokenStatus('rejected'));
    }
    console.log('hi again', error);
  }
}


export function* receiveToken() {
  yield put(actions.setTokenStatus('valid'));
  yield call(saveConfig);
  yield put(actions.fetchAccount());
  yield put(actions.fetchDomains());
}


export function* impersonate({id}) {
  let endpoint = `/admin/accounts/${ id }/impersonate`;
  let { token } = yield call(api, endpoint, 'post');
  yield put(actions.receiveToken(token));
}


export function* listenToSocket() {

  let socket = new Socket();

  yield call([socket, 'connect'], () => { });

  while (true) {
    let event = yield socket.nextEvent();
    console.log(event);

    if (event.type === 'DISCONNECT') {
      yield put(actions.addAlert({
        id: 'connect',
        head: 'Lost Connection To Development Server',
        type: 'error',
        timeout: false
      }));
    }
    else if (event.type === 'RECONNECT') {

    }
    else if (event.type === 'MESSAGE' && event.data.change) {
      
      // // Use a callback for this. actual alerts created elsewhere
      // store.dispatch(addAlert({
      //   body: `Update: ${assetPath}`,
      //   id: data
      // }));

      yield put(actions.addAlert({
        id: event.data.change[0],
        body: 'change: ' + event.data.change,
        type: 'info',
        timeout: 3000
      }));

    }
    else if (event.type === 'MESSAGE' && event.data.error) {

      let head;
      if (event.data.error.filename)
        head = `${event.data.error.type} Error: ${event.data.error.filename}`;
      else
        head = `${event.data.error.type} Error`;

      let body = event.data.error.message;
      if (event.data.error.line)
        body += `\nline: ${event.data.error.line}`;
      if (event.data.error.column)
        body += `\ncolumn: ${event.data.error.column}`;
      
      if (event.data.error.extract)
        body += event.data.error.extract;

      put(actions.addAlert({
        id: event.data.assetPath,
        head,
        body,
        type: 'error',
        timeout: false
      }));

      console.error(event.data.error.message, event.data.error);
    }

  }

}


export function* fetchAccount() {
  try {
    let account = yield call(api, '/account');
    yield put(actions.receiveAccount(account));
    if (account.impersonator)
      yield put(actions.fetchUsers());
  }
  catch (error) {
    if (error.status === 401) {
      // should send an alert here ?
      yield put(actions.receiveToken(null));
      yield put(actions.setTokenStatus('invalid'));
    }
    else
      console.error(error);
  }
}


export function* fetchConfig() {
  let config = yield call(devAPI, '/config');
  yield put(actions.receiveConfig(config));
}


export function* fetchArticle({url, domain}) {
  let opts = { origin: codexOrigin };
  let query = '?full'
  if (domain)
    query += '&host=' + domain;
  let article = yield call(api, url + '.json' + query, 'GET', null, opts);
  yield put(actions.receiveArticle(article));
}


export function* fetchRepositories() {
  let repositories = yield call(devAPI, '/repositories');
  yield put(actions.receiveRepositories(repositories));
}


export function* fetchDomains() {
  let domains = yield call(api, '/domains');
  yield put(actions.receiveDomains(domains));
}


export function* fetchUsers() {
  let users = yield call(api, '/admin/accounts?type=Editor');
  yield put(actions.receiveUsers(users));
}


export function* addAlert({attrs}) {
  if (!attrs.timeout)
    return;

  const removeOrReplace = action => (
    ['ADD_ALERT','REMOVE_ALERT'].includes(action.type) &&
    action.attrs.id === attrs.id
  );

  let result = yield race({
    timeout: delay(attrs.timeout),
    removeOrReplace: take(removeOrReplace),
  });

  if (result.timeout)
    yield put(actions.removeAlert(attrs.id));

}


export function configSelector(state) {
  return state.get('config');
}


export function* saveConfig() {
  let config = yield select(configSelector);
  yield call(devAPI, '/config', 'post', config)
}

export function* repositoryUpdate() {
  yield call(saveConfig);
  yield put(actions.fetchRepositories());
}




  // yield takeEvery(actions.SUBSCRIBE, subscribe);
  // yield takeEvery(actions.UNSUBSCRIBE, unsubscribe);


// const tasks = { };

// export function* subscribe({identifier}) {
//   let i = JSON.stringify(identifier);
//   if (tasks[i])
//     return;
//   const task = yield fork(listen, identifier)
//   tasks[i] = task;
// }


// export function* listen(identifier) {
//   let resolveNext;
//   let callback = data => resolveNext(data);
//   let subscription = yield call(utility.subscribe, identifier, callback);
//   while (true) {
//     let data = yield new Promise(resolve => resolveNext = resolve);
//     yield put(actions.message(identifier, data));
//   }
// }


// export function* unsubscribe({identifier}) {
//   let i = JSON.stringify(identifier);
//   if (!tasks[i])
//     return;
//   yield call(utility.unsubscribe, identifier);
//   yield cancel(tasks[i]);
//   delete tasks[i];
// }


