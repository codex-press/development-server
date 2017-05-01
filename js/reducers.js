import { Map, OrderedMap, List, fromJS } from 'immutable';

import * as actions from './actions';

let initialState = Map({
  ui: Map({
    invalid_token: false,
    current_article: null,
    style_loaded: false,
    modal: null,
  }),
  config: Map({
    token: '',
    repositories: OrderedMap({}),
  }),
  account: null,
  article: Map(),
  articles: List(),
  alerts: OrderedMap(),
  repositories: Map(),
});


export function rootReducer(state = initialState, action) {
  
  let existing;
  switch (action.type) {

    case actions.RESTORE_PREVIOUS_STATE:
      delete action.data.ui.style_loaded;
      return state.set('ui', Map(action.data.ui)).update(
        'alerts',
        alerts => {
          action.data.alerts.forEach(a => alerts = alerts.set('a.id', a));
          return alerts;
        }
      );

    case actions.ADD_ALERT:
      existing = state.getIn(['alerts', action.attrs.id]);
      if (existing)
        window.clearTimeout(existing.timeoutId);
      return state.setIn(['alerts', action.attrs.id], action.attrs);

    case actions.REMOVE_ALERT:
      existing = state.getIn(['alerts', action.id]);
      if (existing)
        window.clearTimeout(existing.timeoutId);
      return state.update('alerts', alerts => alerts.delete(action.id))

    case actions.SET_ARTICLE:
      return state.set('article', Map(action.attrs))

    case actions.TOGGLE_MODAL:
      if (state.getIn(['ui','modal']) === action.value)
        return state.setIn(['ui','modal'], null)
      else
        return state.setIn(['ui','modal'], action.value)

    case actions.STYLE_LOAD_COMPLETE:
      return state.setIn(['ui','style_loaded'], true);

    case actions.SET_INVALID_TOKEN:
      return state.setIn(['ui','invalid_token'], action.value);

    case actions.RECEIVE_ARTICLES:
      return state.set('articles', List(action.data));

    case actions.SET_TOKEN:
      return state.setIn(['config', 'token'], action.value);

    case actions.RECEIVE_CONFIG:
      let config = {}
      config.token = action.data.token || '';
      config.repositories = fromJS(action.data.repositories) || Map();
      return state.set('config', Map(config));

    case actions.RECEIVE_ACCOUNT:
      return state.set('account', Map(action.data));

    case actions.RECEIVE_REPOSITORIES:
      return state.set('repositories', Map(action.data));

    case actions.ADD_REPO:
      return state.updateIn(['config','repositories'], repos =>
        repos.set(action.name, Map({name: action.name, path: action.path}))
      );

    case actions.REMOVE_REPO:
      return state.updateIn(
        ['config','repositories'],
        repos => repos.delete(action.name)
      );

    case actions.UPDATE_REPO:
      return state.updateIn(['config','repositories'], repos => {
        repos = repos.toArray();
        let index = repos.findIndex(r => r.get('name') === action.currentName);
        repos[index] = Map({name: action.name, path: action.path});
        return OrderedMap(repos.map(r => [r.get('name'), r]))
      });

    default:
      return state;

  }
}

