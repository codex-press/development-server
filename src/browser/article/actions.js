import { api } from '../utility';
import Socket from '../socket';
import * as env from '../env';
import { addAlert, reload } from '../actions';
import { reloadAssetPaths } from '../article/render';

export const FETCH_ARTICLE = 'FETCH_ARTICLE';
export const CLEAR_ARTICLE = 'CLEAR_ARTICLE';
export const RECEIVE_ARTICLE = 'RECEIVE_ARTICLE';

export const FETCH_REPOSITORIES = 'FETCH_REPOSITORIES';
export const RECEIVE_REPOSITORIES = 'RECEIVE_REPOSITORIES';

export const CREATE_SOCKET = 'CREATE_SOCKET';



// ARTICLE

export function fetchArticle(url, domain, token) {
  return async dispatch => {

    dispatch({ type: FETCH_ARTICLE, url, domain });

    let query = { full: '' }
    if (domain)
      query.host = domain;

    let article;
    try {
      article = await api(env.codexOrigin + url + '.json', { query, token });
    }
    catch (error) {
      if (error.json)
        article = error.json;
      // XXX could show alert here....
      else
        return console.error(error);
    }

    dispatch(receiveArticle(article));
    return article;
  }
}


export function receiveArticle(data) {
  return {
    type: RECEIVE_ARTICLE,
    data,
  }
}

export function clearArticle(data) {
  return {
    type: CLEAR_ARTICLE,
  }
}


// REPOSITORIES

export function fetchRepositories() {
  return async dispatch => {
    dispatch({ type: FETCH_REPOSITORIES });
    let repositories = await api('/api/repositories');
    dispatch(receiveRepositories(repositories));
    return repositories;
  }
}


export function receiveRepositories(data) {
  return {
    type: RECEIVE_REPOSITORIES,
    data,
  }
}





// SOCKET

let socket;
export function createSocket() {
  return (dispatch, getState) => {

    dispatch({ type: CREATE_SOCKET });

    if (!socket)
      socket = new Socket(socketEventHandler(dispatch, getState));

  }
}

export function socketEventHandler(dispatch, getState) {
  return event => {

    // console.log('socket event', event);

    if (event.type === 'DISCONNECT') {
      dispatch(addAlert({
        id: 'connect',
        body: 'Lost Connection to Development Server',
        type: 'negative',
        timeout: false
      }));
    }
    else if (event.type === 'RECONNECT') {
      dispatch(addAlert({
        id: 'connect',
        body: 'Reconnected to Development Server',
      }));
    }
    else if (event.type === 'MESSAGE' && event.data.event === 'error') {

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

      dispatch(addAlert({
        id: event.data.filename,
        head,
        body,
        type: 'error',
        timeout: false
      }));

    }
    else if (event.type === 'MESSAGE') {

      dispatch(addAlert({
        id: event.data.filename,
        body:
          `File ${ event.data.event }d in <b>${ event.data.repositoryName }</b>:
          ${ event.data.filename }`,
      }));

      const articleAssets = getState().get('article')
        .filter((v,k) => ['assets','header_path','footer_path'].includes(k))
        .toJS();

      const reloadNeeded = reloadAssetPaths(event.data, articleAssets);

      if (reloadNeeded)
        dispatch(reload());

    }
  
  }
}



