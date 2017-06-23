
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

export function restoreState(state) {
  return {
    type: RESTORE_STATE,
    state,
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



export const REQUEST_TOKEN = 'REQUEST_TOKEN';
export const RECEIVE_TOKEN = 'RECEIVE_TOKEN';
export const SET_TOKEN_STATUS = 'SET_TOKEN_STATUS';
export const IMPERSONATE = 'IMPERSONATE';


export function requestToken(email, password) {
  return {
    type: REQUEST_TOKEN,
    email,
    password,
  }
}


export function receiveToken(value) {
  return {
    type: RECEIVE_TOKEN,
    value,
  }
}


export function setTokenStatus(value) {
  return {
    type: SET_TOKEN_STATUS,
    value,
  };
}


export function impersonate(id) {
  return {
    type: IMPERSONATE,
    id,
  };
}



export const FETCH_CONFIG = 'FETCH_CONFIG';
export const RECEIVE_CONFIG = 'RECEIVE_CONFIG';
export const CHANGE_CONFIG = 'CHANGE_CONFIG';

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


export function changeConfig(prop, value) {
  return {
    type: CHANGE_CONFIG,
    prop,
    value,
  }
}




export const FETCH_ACCOUNT = 'FETCH_ACCOUNT';
export const FETCH_REPOSITORIES = 'FETCH_REPOSITORIES';
export const FETCH_ARTICLE = 'FETCH_ARTICLE';
export const FETCH_DOMAINS = 'FETCH_DOMAINS';
export const FETCH_USERS = 'FETCH_USERS';

export const RECEIVE_ACCOUNT = 'RECEIVE_ACCOUNT';
export const RECEIVE_REPOSITORIES = 'RECEIVE_REPOSITORIES';
export const RECEIVE_ARTICLE = 'RECEIVE_ARTICLE';
export const RECEIVE_DOMAINS = 'RECEIVE_DOMAINS';
export const RECEIVE_USERS = 'RECEIVE_USERS';


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


export function fetchDomains() {
  return {
    type: FETCH_DOMAINS,
  }
}


export function receiveDomains(data) {
  return {
    type: RECEIVE_DOMAINS,
    data,
  }
}


export function fetchArticle(url, domain) {
  return {
    type: FETCH_ARTICLE,
    url,
    domain,
  }
}


export function receiveArticle(data) {
  return {
    type: RECEIVE_ARTICLE,
    data,
  }
}


export function fetchUsers() {
  return {
    type: FETCH_USERS,
  }
}


export function receiveUsers(data) {
  return {
    type: RECEIVE_USERS,
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



// export const SUBSCRIBE = 'SUBSCRIBE';
// export const UNSUBSCRIBE = 'UNSUBSCRIBE';
// export const MESSAGE = 'MESSAGE';

// export function subscribe(identifier) {
//   return {
//     type: SUBSCRIBE,
//     identifier,
//   };
// }


// export function unsubscribe(identifier) {
//   return {
//     type: UNSUBSCRIBE,
//     identifier,
//   };
// }


// export function message(identifier, data) {
//   return {
//     type: MESSAGE,
//     identifier,
//     data,
//   };
// }


