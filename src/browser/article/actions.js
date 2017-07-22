import React from 'react';

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

      let body = () => (
        <div>
          <div>
            { event.data.error.type } Error
            { event.data.filename && ': ' + event.data.filename }
          </div>

          <div>
            { event.data.error.message }
          </div>

          { event.data.error.line && 
            <div style={ { fontSize: '0.8em' } } >
              Line: { event.data.error.line }
            </div>
          }
        
          { event.data.error.column &&
            <div style={ { fontSize: '0.8em' } } >
              Column: { event.data.error.column }
            </div>
          }

          { event.data.error.extract &&
            <pre>{ event.data.error.extract }</pre>
          }
        </div>
      )

      dispatch(addAlert({
        id: event.data.filename,
        body,
        type: 'negative',
        timeout: false,
      }));

    }
    else if (event.type === 'MESSAGE') {

      dispatch(addAlert({
        id: event.data.filename,
        body: () => (
          <div>
            File { event.data.event }d in {}
            <b>{ event.data.repositoryName }</b>: {}
            { event.data.filename }
          </div>
        ),
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



