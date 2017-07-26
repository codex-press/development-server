import { combineReducers } from 'redux-immutable';
import { Map, fromJS } from 'immutable';

import { ui } from './app/reducers';
import { article, repositories, resolvedAssets } from './article/reducers';
import { config, account, domains, users } from './config/reducers';
import { alerts } from './alerts/reducers';
import { commits } from './commits/reducers';

import * as actions from './actions';


const root = combineReducers({
  ui,
  article, repositories, resolvedAssets,
  config, account, domains, users,
  alerts, 
  commits,
});


export default (state = Map(), action) => {
  //console.log('action', action);

  if (action.type === actions.RESTORE_STATE)
    state = fromJS(action.state);

  return root(state, action);
}


