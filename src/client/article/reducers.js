import { Map, List, fromJS } from 'immutable';

import * as actions from '../actions';


export function article(state = Map(), action) {
  switch (action.type) {

    case actions.RECEIVE_ARTICLE:
      return fromJS(action.data);

    case actions.CLEAR_ARTICLE:
      return Map();

    default:
      return state;
  }

}


export function repositories(state = Map({}), action) {
  switch (action.type) {

    case actions.RECEIVE_REPOSITORIES:
      return action.data.reduce(
        (map, r) => map.set(r.name, fromJS(r)),
        Map()
      );

    default:
      return state;
  }
}


export function resolvedAssets(state = List([]), action) {
  switch (action.type) {

    case actions.RECEIVE_RESOLVED_ASSETS:
      return fromJS(action.data);

    default:
      return state;
  }
}



