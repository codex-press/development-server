import { Map, List } from 'immutable';

import * as actions from '../actions';

import { fromJS } from 'immutable';


// const initialState = fromJS({"34be9ac5-1149-4665-a986-09947ecdc9a5":{"start":true,"message":"fixing import problems; actually let's make this really long so we can see what that looks like\n","sha":"b22994159949f161b9fdd994847e428cd8cad9f7","repositoryName":"app","id":"34be9ac5-1149-4665-a986-09947ecdc9a5","buildStatus":"done","buildProgress":"1","buildOutput":["building: build/polyfill.js\n","building: index.js\n","building: index.less\n","building: lib/screenfull.js\n","building: lib/shaka.js\n","building: loader.js\n","building: src/analytics.js\n","building: src/animate.js\n","building: src/article.js\n","building: src/collection.js\n"]}});

// export function commits(state = initialState, action) {

export function commits(state = Map(), action) {
  switch (action.type) {

    case actions.RECEIVE_COMMIT:
      return state.merge({ [ action.data.id ] : action.data });

    case actions.CLEAR_COMMIT:
      if (action.id)
        return state.delete(action.id);
      else
        return Map();

    case actions.COMMIT_BUILD_MESSAGE:

      if (action.data.start) {
        return state.set(action.data.id, Map({
          buildOutput   : List(),
          buildStatus   : 'enqueued',
          buildProgress : 0,
        }));
      }

      else if (action.data.output) {

        if (!(state.getIn([action.data.id,'buildOutput']) instanceof List))
          state = state.setIn([action.data.id,'buildOutput'], List())

        return state.update(action.data.id, c => 
          c.setIn(['buildOutput', action.data.line], action.data.output)
           .set('buildProgress', action.data.progress)
        );

      }

      else if (action.data.end) {

        return state.update(action.data.id, c => c.merge({
          buildProgress: 1,
          buildStatus: 'complete',
        }))

      }

    default:
      return state;

  }
}



