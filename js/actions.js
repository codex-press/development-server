import { api, devAPI } from './utility';


export function saveState() {
  return (dispatch, getState) => {
    let state = {
      ui: getState().get('ui').toJS(),
      alerts: getState().get('alerts').toArray(),
    };
    window.sessionStorage.setItem('reduxState', JSON.stringify(state));
  };
}


export function restoreState() {
  return (dispatch, getState) => {
    try {
      let state = JSON.parse(window.sessionStorage.getItem('reduxState'))

      if (!state)
        return;

      if (getState().getIn(['ui','modal']) !== state.ui.modal &&
          state.ui.modal !== 'search')
        dispatch(toggleModal(state.ui.modal));

      state.alerts.forEach(a => dispatch(addAlert(a)));
    }
    catch (e) {
      console.error(e);
    }
  }
}




export const ADD_ALERT = 'ADD_ALERT';
export const REMOVE_ALERT = 'REMOVE_ALERT';

export function addAlert(attrs) {
  return dispatch => {
    attrs = {id: Math.random(), timeout: 2000, ...attrs};
    let remove = () => dispatch(removeAlert(attrs.id));
    attrs.timeoutId = setTimeout(remove, attrs.timeout) 
    return dispatch({
      type: ADD_ALERT,
      attrs,
    });
  }
}

export function removeAlert(id) {
  return {
    type: REMOVE_ALERT,
    id,
  }
}



export const SET_ARTICLE = 'SET_ARTICLE';
export const TOGGLE_MODAL = 'TOGGLE_MODAL';
export const STYLE_LOAD_COMPLETE = 'STYLE_LOAD_COMPLETE';
export const RECEIVE_ARTICLES = 'RECEIVE_ARTICLES';


export function setArticle(attrs) {
  return {
    type: SET_ARTICLE,
    attrs,
  }
}


export function toggleModal(value) {
  return {
    type: TOGGLE_MODAL,
    value,
  }
}

export function styleLoadComplete() {
  return {
    type: STYLE_LOAD_COMPLETE
  }
}


export function fetchArticles() {
  return dispatch => {
    return api('/articles?order=updated_at_desc')
    .then(data => dispatch(receiveArticles(data)));
  }
}


export function receiveArticles(data) {
  return {
    type: RECEIVE_ARTICLES,
    data,
  }
}


export function navigate(url) {
  location.href = url;
}




export const RECEIVE_REPOSITORIES = 'RECEIVE_REPOSITORIES';

export function receiveRepositories(data) {
  return {
    type: RECEIVE_REPOSITORIES,
    data,
  }
}



export const SET_TOKEN = 'SET_TOKEN';
export const RECEIVE_CONFIG = 'RECEIVE_CONFIG';
export const RECEIVE_ACCOUNT = 'RECEIVE_ACCOUNT';
export const ADD_REPO = 'ADD_REPO';
export const REMOVE_REPO = 'REMOVE_REPO';
export const UPDATE_REPO = 'UPDATE_REPO';
export const SET_INVALID_TOKEN = 'SET_INVALID_TOKEN';


export function setToken(value) {
  return dispatch => {

    dispatch({
      type: SET_TOKEN,
      value,
    });

    return Promise.all([
      dispatch(saveConfig()),
      dispatch(loadAccount()),
    ]);
  }
}


export function setInvalidToken(value) {
  return {
    type: SET_INVALID_TOKEN,
    value,
  };
}


export function loadConfig() {
  return dispatch => {
    return devAPI('/config')
    .then(data => dispatch(receiveConfig(data)));
  }
}


export function receiveConfig(data) {
  return {
    type: RECEIVE_CONFIG,
    data,
  }
}


export function saveConfig() {
  return (dispatch, getState) => {
    return devAPI('/config', {post: getState().get('config')})
    // .then(data => console.log(data));
  }
}


export function loadAccount() {
  return dispatch => {
    return api('/account')
    .then(data => dispatch(receiveAccount(data)))
    .catch(data => dispatch(toggleModal('login')));
  }
}

export function receiveAccount(data) {
  return {
    type: RECEIVE_ACCOUNT,
    data,
  }
}


export function addRepo(name, path) {
  return dispatch => {
    dispatch({
      type: ADD_REPO,
      name,
      path,
    });

    return dispatch(saveConfig());
  }
}


export function removeRepo(name) {
  return dispatch => {
    dispatch({
      type: REMOVE_REPO,
      name,
    });

    return dispatch(saveConfig());
  }
}


export function updateRepo(currentName, name, path) {
  return dispatch => {
    dispatch({
      type: UPDATE_REPO,
      currentName,
      name,
      path
    });

    return dispatch(saveConfig());
  }
}


