import { List, fromJS } from 'immutable';

import * as actions from '../actions';


export function alerts(state = List(), action) {

  switch (action.type) {

    case actions.ADD_ALERT:
      let existingIndex = state.findKey(v => v.get('id') === action.attrs.id)
      if (existingIndex >= 0) {
        clearTimeout(state.get(existingIndex).get('timeoutID'));
        return state.set(existingIndex, fromJS(action.attrs));
      }
      else {
        return state.push(fromJS(action.attrs));
      }

    case actions.REMOVE_ALERT:
      return state.delete(state.findKey(v => v.get('id') === action.id));

    default:
      return state;

  }
}


