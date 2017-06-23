import { put, call, select, take, fork, race } from 'redux-saga/effects';
import { delay } from 'redux-saga';

import * as sagas from './sagas';
import * as actions from './actions';
import { api, devAPI } from './utility';
import renderArticle from './article';


test.skip('Intialize with token', () => {
  const account = { token: 'asdfasdfa' };
  const article = { title: 'Article' };
  const repos = { app: ['/app.js'] };
  const s = sagas.initialize();
  expect(s.next().value).toEqual(put(actions.restoreState()));
  expect(s.next().value).toEqual(put(actions.fetchConfig()));
  expect(s.next().value).toEqual(take(actions.RECEIVE_CONFIG));
  expect(s.next({data: account}).value).toEqual(put(actions.fetchAccount()));
  expect(s.next().value).toEqual(fork(sagas.listenToSocket));
  expect(s.next().value).toEqual(put(actions.fetchRepositories()));
  expect(s.next().value).toEqual(take(actions.RECEIVE_REPOSITORIES));
  expect(s.next(repos).value).toEqual(put(actions.fetchArticle()));
  expect(s.next().value).toEqual(take(actions.RECEIVE_ARTICLE));
  expect(s.next(article).value).toEqual(call(renderArticle, article, repos));
  expect(s.next().done).toBe(true);
});


test.skip('Intialize without token', () => {
  const article = { title: 'Article' };
  const repos = { app: ['/app.js'] };
  const s = sagas.initialize();
  expect(s.next().value).toEqual(put(actions.restoreState()));
  expect(s.next().value).toEqual(put(actions.fetchConfig()));
  expect(s.next().value).toEqual(take(actions.RECEIVE_CONFIG));

  // this line is the different part:
  expect(s.next({data: {}}).value).toEqual(put(actions.setInvalidToken(true)));

  expect(s.next().value).toEqual(fork(sagas.listenToSocket));
  expect(s.next().value).toEqual(put(actions.fetchRepositories()));
  expect(s.next().value).toEqual(take(actions.RECEIVE_REPOSITORIES));
  expect(s.next(repos).value).toEqual(put(actions.fetchArticle()));
  expect(s.next().value).toEqual(take(actions.RECEIVE_ARTICLE));
  expect(s.next(article).value).toEqual(call(renderArticle, article, repos));
  expect(s.next().done).toBe(true);
});


test.skip('listenToSocket', () => {
});

// export function* listenToSocket() {

//   let socket = new Socket();

//   yield call([socket, 'connect'], () => { });

//   while (true) {
//     let event = yield socket.nextEvent();
//     // console.log(event);
//   }
// }


test('Successful fetchAccount', () => {
  const account = { name: 'Tim' };
  const s = sagas.fetchAccount();
  expect(s.next().value).toEqual(call(api, '/account'));
  expect(s.next(account).value).toEqual(put(actions.receiveAccount(account)));
  expect(s.next().done).toBe(true);
});


test('Unsuccessful fetchAccount', () => {
  const account = { name: 'Tim' };
  const s = sagas.fetchAccount();
  expect(s.next().value).toEqual(call(api, '/account'));
  expect(s.throw({status: 401}).value).toEqual(put(actions.receiveToken(null)));
  expect(s.next().value).toEqual(put(actions.setTokenStatus('invalid')));
  expect(s.next().done).toBe(true);
});


test('Successful fetchConfig', () => {
  const config = { token: 'oasdvcads90v0adsva' };
  const s = sagas.fetchConfig();
  expect(s.next().value).toEqual(call(devAPI, '/config'));
  expect(s.next(config).value).toEqual(put(actions.receiveConfig(config)));
  expect(s.next().done).toBe(true);
});


test('Removes alert after timeout', () => {
  const attrs = { id: 0, body: 'hi', timeout: 500 }
  const s = sagas.addAlert({attrs});
  let expected = s.next().value;
  expect(expected).toEqual(
    race({
      timeout: expected.RACE.timeout,
      removeOrReplace: take(expected.RACE.removeOrReplace.TAKE.pattern)
    })
  );
  expect(s.next({timeout: true}).value).toEqual(put(actions.removeAlert(attrs.id)));
  expect(s.next().done).toBe(true);
});


test('Replacing alert does not remove it', () => {
  const attrs = { id: 0, body: 'hi', timeout: 500 }
  const s = sagas.addAlert({attrs});
  let expected = s.next().value;
  expect(expected).toEqual(
    race({
      timeout: expected.RACE.timeout,
      removeOrReplace: take(expected.RACE.removeOrReplace.TAKE.pattern)
    })
  );
  expect(s.next({removeOrReplace: true}).done).toBe(true);
});


test('Successful saveConfig', () => {
  const config = { token: 'oasdvcads90v0adsva' };
  const s = sagas.saveConfig();
  expect(s.next().value).toEqual(select(sagas.configSelector));
  expect(s.next(config).value).toEqual(call(devAPI, '/config', 'post', config));
  expect(s.next().done).toBe(true);
});


