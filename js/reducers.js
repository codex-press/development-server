import { Map, OrderedMap, List } from 'immutable';

import * as actions from './actions';

let initialState = Map({
  ui: Map({
    current_article: null,
    style_loaded: false,
    modal: null,
  }),
  config: Map(),
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

    case actions.RECEIVE_ARTICLES:
      return state.set('articles', List(action.data));

    case actions.SET_TOKEN:
      return state.setIn(['config','token'], action.token);

    case actions.RECEIVE_CONFIG:
      return state.set('config', Map(action.data));

    default:
      return state;

  }
}

