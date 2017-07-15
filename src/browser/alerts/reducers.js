import { Map } from 'immutable';

import * as actions from '../actions';


export function alerts(state = Map({}), action) {

  switch (action.type) {

    case actions.ADD_ALERT:
      // clears existing timeout if it exists
      clearTimeout(state.getIn([action.attrs.id, 'timeoutID']));
      return state.set(action.attrs.id, Map(action.attrs));

    case actions.REMOVE_ALERT:
      return state.delete(action.id);

    default:
      return state;

  }
}


