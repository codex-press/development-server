import { Map, OrderedMap, List, fromJS } from 'immutable';

import * as actions from './actions';

let initialState = Map({
  ui: Map({
    token_status: null, // pending, rejected, changing, valid, invalid
    modal: null,
    focus: document.hasFocus(),
  }),
  config: null,
  account: null,
  article: Map(),
  alerts: OrderedMap(),
  repositories: Map(),
  domains: Map(),
  users: Map(),
});



export default function rootReducer(state = initialState, action) {

  switch (action.type) {

    case actions.SAVE_STATE:
      let serializedState = {
        ui: state.get('ui').toJS(),
        alerts: state.get('alerts').toJS(),
      };
      window.sessionStorage.reduxState = JSON.stringify(serializedState);
      return state;

    case actions.FOCUS:
      return state.setIn(['ui', 'focus'], true);

    case actions.BLUR:
      return state.setIn(['ui', 'focus'], false);

    case actions.ADD_ALERT:
      return state.setIn(['alerts', action.attrs.id], Map(action.attrs));

    case actions.REMOVE_ALERT:
      return state.update('alerts', alerts => alerts.delete(action.id))

    case actions.RECEIVE_ARTICLE:
      return state.set('article', Map(action.data))

    case actions.TOGGLE_MODAL:
      if (state.getIn(['ui','modal']) === action.value)
        return state.setIn(['ui','modal'], null)
      else
        return state.setIn(['ui','modal'], action.value)

    case actions.SET_TOKEN_STATUS:
      return state.setIn(['ui','token_status'], action.value);

    case actions.RECEIVE_TOKEN:
      sessionStorage.token = action.value;
      return state.setIn(['config', 'token'], action.value);

    case actions.RECEIVE_CONFIG:
      let config = {
        domain: '',
        disable_csp: false,
        token: null,
        ...action.data
      }

      if (config.token)
        sessionStorage.token = config.token;
      else
        sessionStorage.removeItem('token');

      config.repositories = fromJS(action.data.repositories) || Map();
      return state.set('config', Map(config));

    case actions.CHANGE_CONFIG:
      return state.setIn(['config', action.prop], action.value);

    case actions.FETCH_ACCOUNT:
      return state.set('account', null);

    case actions.RECEIVE_ACCOUNT:
      return state.set('account', fromJS(action.data));

    case actions.RECEIVE_REPOSITORIES:
      return state.set('repositories', fromJS(action.data));

    case actions.RECEIVE_DOMAINS:
      return state.set('domains', fromJS(action.data));

    case actions.RECEIVE_USERS:
      return state.set('users', fromJS(action.data));

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


    // case actions.MESSAGE:
    //   if (action.identifier.channel !== 'CommitCompileChannel')
    //     return state;
    //   else if (action.data.start)
    //     return state.setIn([action.data.id, 'compile_enqueued'], true)
    //   else if (action.data.output) {
    //     if (!(state.getIn([action.data.id,'compile_output']) instanceof List))
    //       state = state.setIn([action.data.id,'compile_output'], List())
    //     return state.setIn(
    //       [action.data.id, 'compile_output', action.data.line],
    //       action.data.output
    //     )
    //     .setIn(
    //       [action.data.id, 'compile_progress'],
    //       action.data.progress
    //     );
    //   }
    //   else if (action.data.end) {
    //     return state.set(
    //       action.data.id,
    //       Map({...action.data.commit, compile_progress: 1}),
    //     )
    //   }


    default:
      return state;

  }
}

