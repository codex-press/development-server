import { Map, fromJS } from 'immutable';

import * as actions from '../actions';


let initialUI = {
  token_status: null, // pending, rejected, changing, valid, invalid
  modal: null,
  focus: document.hasFocus(),
  build_output_minimal: false,
  article_changed: true,
};



export function ui(state = Map(initialUI), action) {

  switch (action.type) {

    case actions.FOCUS:
      return state.set('focus', true);

    case actions.BLUR:
      return state.set('focus', false);

    case actions.ARTICLE_CHANGED:
      return state.set('article_changed', true);

    case actions.SET_BUILD_OUTPUT_MINIMAL:
      return state.set('build_output_minimal', action.value);
    
    case actions.COMMIT_BUILD_MESSAGE:
      if (action.data.start)
        return state.set('build_output_minimal', false);
      else
        return state;

    case actions.TOGGLE_MODAL:
      if (state.get('modal') === action.value)
        return state.set('modal', null)
      else
        return state.set('modal', action.value)

    case actions.SET_TOKEN_STATUS:
      // XXX
      // pending, rejected, changing, valid, invalid
      return state.set('token_status', action.value);

    default:
      return state;
  }

}


