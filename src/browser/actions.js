
export const INITIALIZE = 'INITIALIZE';

export function initialize() {
  return {
    type: INITIALIZE,
  }
}



export const SAVE_STATE = 'SAVE_STATE';
export const RESTORE_STATE = 'RESTORE_STATE';

export function saveState() {
  return {
    type: SAVE_STATE,
  }
}

export function restoreState() {
  return {
    type: RESTORE_STATE,
  }
}




export const ADD_ALERT = 'ADD_ALERT';
export const REMOVE_ALERT = 'REMOVE_ALERT';

export function addAlert(attrs) {
  attrs = {id: Math.random(), timeout: 2000, ...attrs};
  return {
    type: ADD_ALERT,
    attrs,
  };
}

export function removeAlert(id) {
  return {
    type: REMOVE_ALERT,
    id,
  }
}




export const TOGGLE_MODAL = 'TOGGLE_MODAL';
export const STYLE_LOAD_COMPLETE = 'STYLE_LOAD_COMPLETE';
export const BLUR = 'BLUR';
export const FOCUS = 'FOCUS';

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
export function styleLoadComplete() {
  return {
    type: STYLE_LOAD_COMPLETE
  }
}





export const SET_TOKEN = 'SET_TOKEN';
export const SET_INVALID_TOKEN = 'SET_INVALID_TOKEN';

export const FETCH_CONFIG = 'FETCH_CONFIG';
export const FETCH_ACCOUNT = 'FETCH_ACCOUNT';
export const FETCH_REPOSITORIES = 'FETCH_REPOSITORIES';
export const FETCH_ARTICLE = 'FETCH_ARTICLE';

export const RECEIVE_CONFIG = 'RECEIVE_CONFIG';
export const RECEIVE_ACCOUNT = 'RECEIVE_ACCOUNT';
export const RECEIVE_REPOSITORIES = 'RECEIVE_REPOSITORIES';
export const RECEIVE_ARTICLE = 'RECEIVE_ARTICLE';

export function setToken(value) {
  return {
    type: SET_TOKEN,
    value,
  }
}


export function setInvalidToken(value) {
  return {
    type: SET_INVALID_TOKEN,
    value,
  };
}


export function fetchConfig() {
  return {
    type: FETCH_CONFIG,
  }
}


export function receiveConfig(data) {
  return {
    type: RECEIVE_CONFIG,
    data,
  }
}


export function fetchAccount() {
  return  {
    type: FETCH_ACCOUNT,
  }
}


export function receiveAccount(data) {
  return {
    type: RECEIVE_ACCOUNT,
    data,
  }
}


export function fetchRepositories() {
  return  {
    type: FETCH_REPOSITORIES,
  }
}


export function receiveRepositories(data) {
  return {
    type: RECEIVE_REPOSITORIES,
    data,
  }
}


export function fetchArticle() {
  return {
    type: FETCH_ARTICLE,
  }
}


export function receiveArticle(data) {
  return {
    type: RECEIVE_ARTICLE,
    data,
  }
}



export const ADD_REPOSITORY = 'ADD_REPOSITORY';
export const REMOVE_REPOSITORY = 'REMOVE_REPOSITORY';
export const CHANGE_REPOSITORY = 'CHANGE_REPOSITORY';

export function addRepository(name, path) {
  return {
    type: ADD_REPOSITORY,
    name,
    path,
  }
}


export function removeRepository(name) {
  return {
    type: REMOVE_REPOSITORY,
    name,
  }
}


export function changeRepository(currentName, name, path) {
  return {
    type: CHANGE_REPOSITORY,
    currentName,
    name,
    path,
  }
}



