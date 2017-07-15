import { api } from '../utility';
import Socket from '../socket';
import * as env from '../env';
import { addAlert, reload } from '../actions';


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
      article = await api(env.contentOrigin + url + '.json', { query, token });
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
  return dispatch => {

    dispatch({ type: CREATE_SOCKET });

    if (!socket)
      socket = new Socket(socketEventHandler(dispatch));

  }
}

function socketEventHandler(dispatch) {
  return event => {

    console.log('socket event', event);

    if (event.type === 'DISCONNECT') {
      dispatch(addAlert({
        id: 'connect',
        head: 'Lost Connection to Development Server',
        type: 'error',
        timeout: false
      }));
    }
    else if (event.type === 'RECONNECT') {
      dispatch(addAlert({
        id: 'connect',
        head: 'Reconnected to Development Server',
        type: 'info',
      }));
    }
    else if (event.type === 'MESSAGE' && event.data.change) {

      dispatch(addAlert({
        id: event.data.change[0],
        body: 'change: ' + event.data.change,
        type: 'info',
      }));

      if (event.data.change[0].endsWith('.js'))
        dispatch(reload());

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

      dispatch(addAlert({
        id: event.data.assetPath,
        head,
        body,
        type: 'error',
        timeout: false
      }));

    }
  
  }
}



