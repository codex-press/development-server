import React from 'react';

import { api, addStylesheet } from '../utility';
import Socket from '../socket';
import * as env from '../env';
import { addAlert, reload } from '../actions';

export const FETCH_ARTICLE = 'FETCH_ARTICLE';
export const CLEAR_ARTICLE = 'CLEAR_ARTICLE';
export const RECEIVE_ARTICLE = 'RECEIVE_ARTICLE';
export const RENDER_ARTICLE = 'RENDER_ARTICLE';

// these are returned by article renderer
export const RECEIVE_RESOLVED_ASSETS = 'RECEIVE_RESOLVED_ASSETS';

export const FETCH_REPOSITORIES = 'FETCH_REPOSITORIES';
export const RECEIVE_REPOSITORIES = 'RECEIVE_REPOSITORIES';

export const CREATE_SOCKET = 'CREATE_SOCKET';

// instance of ClientRender from '/render/src/client.js'
var renderer;


// ARTICLE

export function fetchArticle() {
  return async (dispatch, getState) => {

    dispatch({ type: FETCH_ARTICLE });
    
    const domain = getState().getIn(['config','domain']);

    const query = { full: '' }
    if (domain)
      query.host = domain;

    const token = getState().getIn(['config','token']);

    let article;
    try {
      const url = env.codexOrigin + location.pathname + '.json';
      article = await api(url, { query, token });
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


export function renderArticle() {
  return async (dispatch, getState) => {

    dispatch({ type: RENDER_ARTICLE });

    const article = getState().get('article').toJS();
    const repositories = getState().get('repositories').toJS();

    addStylesheet('/app/index.css');

    const module = await CodexLoader.import('/render/src/client.js');
    const { default: ClientRenderer } = module;

    renderer = new ClientRenderer();

    article.development_repositories = repositories;
    article.content_origin = env.contentOrigin;
    article.top_origin = location.origin;

    await renderer.set(article);

    dispatch(receiveResolvedAssets(renderer.resolvedAssets()));
  }
}


export function receiveResolvedAssets(data) {
  return {
    type: RECEIVE_RESOLVED_ASSETS,
    data,
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

      const verb = event.data.event + (event.data.event === 'add' ? 'ed' : 'd');

      dispatch(addAlert({
        id: event.data.filename,
        body: () => (
          <div>
            File { verb } in {}
            <b>{ event.data.repositoryName }</b>: {}
            { event.data.filename }
          </div>
        ),
      }));

      let needsReload = (
        renderer && (
          event.data.filename === 'package.json' ||
          renderer.updateAsset(event.data.event, event.data.paths))
      );

      if (needsReload)
        dispatch(reload());

    }
  
  }
}


