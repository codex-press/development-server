import { Map, OrderedMap, List, fromJS } from 'immutable';

import * as actions from './actions';

let initialState = Map({
  ui: Map({
    invalid_token: false,
    style_loaded: false,
    modal: null,
    focus: document.hasFocus(),
  }),
  config: null,
  account: null,
  article: Map(),
  alerts: OrderedMap(),
  repositories: Map(),
});



export default function rootReducer(state = initialState, action) {

  let existing;
  switch (action.type) {

    // export function saveState() {
    //   return (dispatch, getState) => {
    //     let state = {
    //       ui: getState().get('ui').toJS(),
    //       alerts: getState().get('alerts').toArray(),
    //     };
    //     window.sessionStorage.setItem('reduxState', JSON.stringify(state));
    //   };
    // }


    // export function restoreState() {
    //   return (dispatch, getState) => {
    //     try {
    //       let state = JSON.parse(window.sessionStorage.getItem('reduxState'))

    //       if (!state)
    //         return;

    //       if (getState().getIn(['ui','modal']) !== state.ui.modal &&
    //           state.ui.modal !== 'search')
    //         dispatch(toggleModal(state.ui.modal));

    //       state.alerts.forEach(a => dispatch(addAlert(a)));
    //     }
    //     catch (e) {
    //       console.error(e);
    //     }
    //   }
    // }

    case actions.FOCUS:
      return state.setIn(['ui', 'focus'], true);

    case actions.BLUR:
      return state.setIn(['ui', 'focus'], false);

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

    case actions.RECEIVE_ARTICLE:
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

    case actions.SET_TOKEN:
      sessionStorage.token = action.value;
      return state.setIn(['config', 'token'], action.value);

    case actions.RECEIVE_CONFIG:
      let config = {}
      config.token = action.data.token || '';
      sessionStorage.token = action.data.token;
      config.repositories = fromJS(action.data.repositories) || Map();
      return state.set('config', Map(config));

    case actions.RECEIVE_ACCOUNT:
      return state.set('account', Map(action.data));

    case actions.RECEIVE_REPOSITORIES:
      return state.set('repositories', Map(action.data));

    case actions.ADD_REPOSITORY:
      return state.updateIn(['config','repositories'], repos =>
        repos.set(action.name, Map({name: action.name, path: action.path}))
      );

    case actions.REMOVE_REPOSITORY:
      return state.updateIn(
        ['config','repositories'],
        repos => repos.delete(action.name)
      );

    case actions.CHANGE_REPOSITORY:
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

