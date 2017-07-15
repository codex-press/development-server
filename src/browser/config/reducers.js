import { Map, OrderedMap, fromJS } from 'immutable';

import * as actions from '../actions';


export function config(state = Map({}), action) {

  switch (action.type) {

    case actions.RECEIVE_TOKEN:
      return state.set('token', action.value);

    case actions.RECEIVE_CONFIG:
      let config = {
        domain: '',
        disable_csp: false,
        token: null,
        ...action.data
      }

      config.repositories = fromJS(action.data.repositories) || Map();
      return Map(config);

    case actions.CHANGE_CONFIG:
      return state.set(action.prop, action.value);

    case actions.ADD_REPOSITORY:
      return state.update('repositories', repos =>
        repos.set(action.name, Map({name: action.name, path: action.path}))
      );

    case actions.REMOVE_REPOSITORY:
      return state.update(
        'repositories',
        repos => repos.delete(action.name)
      );

    case actions.CHANGE_REPOSITORY:
      return state.update('repositories', repos => {
        repos = repos.toArray();
        let index = repos.findIndex(r => r.get('name') === action.currentName);
        repos[index] = Map({name: action.name, path: action.path});
        return OrderedMap(repos.map(r => [r.get('name'), r]))
      });

    default:
      return state;
  }
}


export function account(state = null, action) {

  switch (action.type) {

    case actions.RECEIVE_ACCOUNT:
      return fromJS(action.data);

    default:
      return state;
  }

}



export function domains(state = Map(), action) {
  switch (action.type) {

    case actions.RECEIVE_DOMAINS:
      return fromJS(action.data);

    default:
      return state;
  }

}


export function users(state = Map({}), action) {
  switch (action.type) {

    case actions.RECEIVE_USERS:
      return fromJS(action.data);

    default:
      return state;

  }
}


