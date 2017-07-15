import { Map, List } from 'immutable';

import * as actions from '../actions';

import { fromJS } from 'immutable';


// let initialState = fromJS({"34be9ac5-1149-4665-a986-09947ecdc9a5":{"start":true,"message":"fixing import problems\n","sha":"b22994159949f161b9fdd994847e428cd8cad9f7","repository_name":"app","id":"34be9ac5-1149-4665-a986-09947ecdc9a5","build_status":"enqueued","build_progress":"0.32","build_output":["building: build/polyfill.js\n","building: index.js\n","building: index.less\n","building: lib/screenfull.js\n","building: lib/shaka.js\n","building: loader.js\n","building: src/analytics.js\n","building: src/animate.js\n","building: src/article.js\n","building: src/collection.js\n"]}});


export function commits(state = Map(), action) {
  switch (action.type) {

    case actions.CLEAR_COMMITS:
      return Map();

    case actions.COMMIT_BUILD_MESSAGE:

      if (action.data.start) {
        return state.set(action.data.id, Map({
          build_output   : List(),
          build_status   : 'enqueued',
          build_progress : 0,
        }));
      }

      else if (action.data.output) {

        if (!(state.getIn([action.data.id,'build_output']) instanceof List))
          state = state.setIn([action.data.id,'build_output'], List())

        return state.update(action.data.id, c => 
          c.setIn(['build_output', action.data.line], action.data.output)
           .set('build_progress', action.data.progress)
        );

      }

      else if (action.data.end) {

        return state.update(action.data.id, c => c.merge({
          build_progress: 1,
          build_status: 'complete',
        }))

      }

    default:
      return state;

  }
}



