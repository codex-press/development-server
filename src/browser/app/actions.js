import ActionCable from 'actioncable';
import { isLocalhost, api } from '../utility';
import * as env from '../env';
import renderArticle from '../article/render';
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
  return async dispatch => {

    let state = dispatch(restoreState());

    if (state) {

      if (state.article.url !== location.pathname) {
        state.article = await dispatch(actions.fetchArticle(
          location.pathname,
          state.config.domain,
          state.config.token,
        ));
      }

      const repositories = Object.keys(state.repositories).map(k => {
        return state.repositories[k]
      });

      renderArticle(state.article, repositories);

      if (isLocalhost)
        dispatch(createCable(state.config.token, state.account.id));

      dispatch(actions.createSocket());

      return;
    }

    let config = await dispatch(actions.fetchConfig());

    let [ article, repositories ] = await Promise.all([
      dispatch(actions.fetchArticle(location.pathname, config.domain, config.token)),
      dispatch(actions.fetchRepositories()),
    ]);

    dispatch(actions.createSocket());

    try {
      if (config.token && isLocalhost) {
        dispatch(actions.fetchDomains());
        let account = await dispatch(actions.fetchAccount());
        if (isLocalhost)
          dispatch(createCable(config.token, account.id));
      }

      renderArticle(article, repositories);
    }
    catch (e) {
      console.error('Article render error:', e);
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
    if (url.endsWith('/'))
      url = url.slice(0, -1);
    dispatch({ type: NAVIGATE, url });
    dispatch(saveState());
    location = url;
  }
}



export function saveState() {
  return (dispatch, getState) => {
    dispatch({ type: SAVE_STATE });
    window.sessionStorage.reduxState = JSON.stringify(getState().toJS());
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
      catch (e) {
        window.sessionStorage.removeItem('reduxState');
        console.log(e);
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
export function createCable(token, accountID) {
  return async (dispatch, getState) => {

    dispatch({ type: CREATE_CABLE });

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
        dispatch({ type: COMMIT_BUILD_MESSAGE, data });
      }
    });

    
    const changeIdentifier = {
      channel: 'ChangesChannel',
      account: accountID,
    }
    
    cable.subscriptions.create(changeIdentifier, {
      received: data => {

        if (data.id === getState().getIn(['article','id'])) {
          dispatch(actions.addAlert({
            id: 'article_change',
            body: 'This article has changed',
            dismissable: true,
            buttons: {
              Reload: () => {
                dispatch(actions.removeAlert('article_change'));
                dispatch(actions.clearArticle());
                dispatch(reload());
              }
            },
          }));
        }

      }
    });

  }
}


