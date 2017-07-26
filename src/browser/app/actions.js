import ActionCable from 'actioncable';
import { isLocalhost, api } from '../utility';
import * as env from '../env';
import * as actions from '../actions';


export const API_ERROR = 'API_ERROR';

export const INITIALIZE = 'INITIALIZE';
export const RELOAD = 'RELOAD';
export const NAVIGATE = 'NAVIGATE';

export const SAVE_STATE = 'SAVE_STATE';
export const RESTORE_STATE = 'RESTORE_STATE';

export const TOGGLE_MODAL = 'TOGGLE_MODAL';
export const BLUR = 'BLUR';
export const FOCUS = 'FOCUS';

export const CREATE_CABLE = 'CREATE_CABLE';
export const COMMIT_BUILD_MESSAGE = 'COMMIT_BUILD_MESSAGE';
export const ARTICLE_CHANGED = 'ARTICLE_CHANGED';



export function apiError(error) {
  return dispatch => {

    dispatch({
      type: API_ERROR,
      status: error.status,
      message: error.message,
    });

    if (error.status === 401) {
      dispatch(actions.clearToken());      
    }
    else {
      throw error;
    }

  }
}


export function initialize() {
  return async (dispatch, getState) => {

    try {

      const restored = dispatch(restoreState());

      const fetchesArticle = (
        !restored ||
        !('article' in restored) ||
        restored.article.url !== location.pathname
      );

      // this has the domain name, which we need to fetchArticle. n.b. if
      // not on localhost, the token will not be included
      await dispatch(actions.fetchConfig());

      await Promise.all([
        fetchesArticle ? dispatch(actions.fetchArticle()) : Promise.resolve(),
        dispatch(actions.fetchRepositories()),
      ]);

      dispatch(actions.renderArticle());

      dispatch(actions.createSocket());

      if (isLocalhost && getState().getIn(['config','token'])) {
        dispatch(actions.fetchDomains());
        await dispatch(actions.fetchAccount());
        dispatch(createCable());
      }

    }
    catch (error) {
      console.error(error);
    }

  }
}


export function reload() {
  return dispatch => {
    dispatch({ type: RELOAD });
    dispatch(saveState());
    location.reload();
  }
}


export function navigate(url) {
  return dispatch => {
    if (url.length > 1 && url.endsWith('/'))
      url = url.slice(0, -1);
    dispatch({ type: NAVIGATE, url });
    dispatch(saveState(false));
    location = url;
  }
}


export function saveState(includeArticle = true) {
  return (dispatch, getState) => {
    dispatch({ type: SAVE_STATE });
    const keys = ['ui','alerts'];
    if (includeArticle) keys.push('article')
    const state = getState().filter((v, k) => keys.includes(k));
    window.sessionStorage.reduxState = JSON.stringify(state.toJS());
  }
}




export function restoreState(state) {
  return dispatch => {

    if ('reduxState' in window.sessionStorage) {
      try {
        let state = JSON.parse(window.sessionStorage.reduxState)
        window.sessionStorage.removeItem('reduxState');

        // recreate timeouts for alerts
        state.alerts.map(alert => {
          if (alert.timeout) {
            alert.timeoutID = setTimeout(
              () => dispatch(actions.removeAlert(alert.id)),
              alert.timeout
            );
          }
        });

        dispatch({ type: RESTORE_STATE, state });

        return state;
      }
      catch (error) {
        console.error(error);
        window.sessionStorage.removeItem('reduxState');
      }
    }

  }
}




// UI

export function toggleModal(value) {
  return {
    type: TOGGLE_MODAL,
    value,
  }
}

export function blur() {
  return {
    type: BLUR,
  }
}

export function focus() {
  return {
    type: FOCUS,
  }
}




var cable;
export function createCable() {
  return async (dispatch, getState) => {

    dispatch({ type: CREATE_CABLE });
    
    const token = getState().getIn(['config','token']);
    const accountID = getState().getIn(['account','id']);

    if (cable)
      cable.disconnect();

    let endpoint = env.apiOrigin + '/cable?token=' + token;
    cable = ActionCable.createConsumer(endpoint);

    const buildIdentifier = {
      channel: 'CommitBuildChannel',
      account: accountID,
    }
    
    cable.subscriptions.create(buildIdentifier, {
      received: data => {
        const commit = getState().getIn(['commits', data.id]);
        dispatch({ type: COMMIT_BUILD_MESSAGE, data });
        // fetch it if it's not already in the state
        if (!commit)
          dispatch(actions.fetchCommit(data.id));
      }
    });

    
    const changeIdentifier = {
      channel: 'ChangesChannel',
      account: accountID,
    }
    
    cable.subscriptions.create(changeIdentifier, {
      received: data => {

        if (data.id === getState().getIn(['article','id'])) {
          const a = `<a href=${ location.href }>`;
          dispatch(actions.addAlert({
            id: 'article_change',
            body: `This article has changed. ${a}Reload</a>`,
            dismissable: false,
            timeout: false,
          }));
        }

      }
    });

  }
}


