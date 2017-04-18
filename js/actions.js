import { api } from './helpers';


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




export const SET_CONFIG = 'SET_CONFIG';
export const RECEIVE_CONFIG = 'RECEIVE_CONFIG';

export function setConfig(prop, value) {
  return {
    type: SET_CONFIG,
    prop,
    value,
  }
}


export function loadConfig() {
  return dispatch => {
    return fetch('/api/config')
    .then(response => response.json())
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
    return fetch('/api/config', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(getState().get('config')),
    })
    .then(response => response.json())
    // .then(data => console.log(data));
  }
}
