import { takeEvery, fork, take, put, call, select } from 'redux-saga/effects';

import { api, devAPI } from './utility';
import * as actions from './actions';
import renderArticle from './article';
import Socket from './socket';

export default function* saga() {
  yield takeEvery(actions.INITIALIZE, initialize);
  yield takeEvery(actions.FETCH_CONFIG, fetchConfig);
  yield takeEvery(actions.ADD_ALERT, addAlert);
  yield takeEvery(actions.FETCH_ACCOUNT, fetchAccount);
  yield takeEvery(actions.SET_TOKEN, fetchAccount);
  yield takeEvery(actions.SET_TOKEN, saveConfig);
  yield takeEvery(actions.ADD_REPOSITORY, saveConfig);
  yield takeEvery(actions.REMOVE_REPOSITORY, saveConfig);
  yield takeEvery(actions.CHANGE_REPOSITORY, saveConfig);
}


export function* initialize() {

  // restore some state from session storage; save before closing the window
  yield put(actions.restoreState());
  yield put(actions.fetchConfig());

  let { data } = yield take(actions.RECEIVE_CONFIG);

  // load the account information if we have an API key
  if (data.token)
    yield put(actions.fetchAccount());
  else
    yield put(actions.setInvalidToken(true));

  yield fork(listenToSocket);

  yield put(actions.fetchRepositories());
  let repositories = yield take(actions.RECEIVE_REPOSITORIES);

  yield put(actions.fetchArticle());
  let article = yield take(actions.RECEIVE_ARTICLE);

  yield call(renderArticle, article, repositories);
}


export function* listenToSocket() {

  let socket = new Socket();

  yield call([socket, 'connect'], () => { });

  while (true) {
    let event = yield socket.nextEvent();
    // console.log(event);

    // console.log('socket close', error);

    // first time we got a close, so alert that it was lost
    // if (!this.reconnectTimeout) {
    //   this.sendAlert({
    //     head: 'Lost Connection To Development Server',
    //     id: 'connect',
    //     type: 'error',
    //     timeout: false
    //   });
    // }



    // if (data.publicUpdate) {
    //   if (data.publicUpdate === 'public/main.js')
    //     location.reload();
    //   else if (data.publicUpdate === 'public/main.css') {
    //     let el = document.querySelector('#dev-server');
    //     let link = el.shadowRoot.querySelector('link');
    //     link.href = `/main.css?${Date.now()}`
    //   }
    // }

    // return;

    // // Use a callback for this. actual alerts created elsewhere
    // store.dispatch(addAlert({
    //   body: `Update: ${assetPath}`,
    //   id: data
    // }));

    // if (data.fileList)
    //   this.callback(data.fileList);




    // return;

    // this.fileList = data.fileList;

    // if (data.error) {

    //   let head;
    //   if (data.error.filename)
    //     head = `${data.error.type} Error: ${data.error.filename}`;
    //   else
    //     head = `${data.error.type} Error`;

    //   let body = data.error.message;
    //   if (data.error.line)
    //     body += `\nline: ${data.error.line}`;
    //   if (data.error.column)
    //     body += `\ncolumn: ${data.error.column}`;

    //   this.sendAlert({
    //     head,
    //     body,
    //     pre: data.error.extract,
    //     type: 'error',
    //     id: data.assetPath,
    //     timeout: false
    //   });

    //   console.error(data.error.message, data.error);
    // }
    // else if (data.assetPath) {

    //   this.sendAlert({
    //     body: `Update: ${data.assetPath}`,
    //     id: data.assetPath
    //   });
    //   this.fileList = data.fileList;
    //   renderer.updateAsset(data.assetPath);
    // }

    // yield put(actions.receiveRepositories(repositories))

  }
}


export function* fetchAccount() {
  try {
    let account = yield call(api, '/account');
    yield put(actions.receiveAccount(account));
  }
  catch (error) {
    if (error.status === 401)
      yield put(actions.setInvalidToken());
    else
      console.error(error);
  }
}


export function* fetchConfig() {
  let config = yield call(devAPI, '/config');
  yield put(actions.receiveConfig(config));
}


export function* addAlert(attrs) {
  // let remove = () => dispatch(removeAlert(attrs.id));
  // attrs.timeoutId = setTimeout(remove, attrs.timeout) 
}


export function configSelector(state) {
  return state.get('config');
}


export function* saveConfig() {
  let config = yield select(configSelector);
  yield call(devAPI, '/config', 'post', config)
}


