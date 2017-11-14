import { Map, fromJS } from 'immutable';

import * as actions from '../actions';


let initialUI = {
  tokenStatus: null, // pending, rejected, changing, valid, invalid
  modal: null,
  focus: document.hasFocus(),
  buildOutput: 'centered',
  articleChanged: true,
};



export function ui(state = Map(initialUI), action) {

  switch (action.type) {

    case actions.FOCUS:
      return state.set('focus', true);

    case actions.BLUR:
      return state.set('focus', false);

    case actions.ARTICLE_CHANGED:
      return state.set('articleChanged', true);

    case actions.RECEIVE_COMMIT:
      return state.set('buildOutput', 'centered');

    case actions.SET_BUILD_OUTPUT_STATE:
      return state.set('buildOutput', action.value);

    case actions.TOGGLE_MODAL:
      if (state.get('modal') === action.value)
        return state.set('modal', null)
      else
        return state.set('modal', action.value)

    case actions.SET_TOKEN_STATUS:
      // pending, rejected, changing, valid, invalid
      return state.set('tokenStatus', action.value);

    default:
      return state;
  }

}


