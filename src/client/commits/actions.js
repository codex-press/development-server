import { api } from '../utility';
import * as env from '../env';

export const FETCH_COMMIT = 'FETCH_COMMIT';
export const RECEIVE_COMMIT = 'RECEIVE_COMMIT';
export const CLEAR_COMMIT = 'CLEAR_COMMIT';

export const SET_BUILD_OUTPUT_STATE = 'SET_BUILD_OUTPUT_STATE';


export function setBuildOutputState(value) {
  return {
    type: SET_BUILD_OUTPUT_STATE,
    value,
  }
}


export function fetchCommit(id) {
  return async (dispatch, getState) => {
    dispatch({ type: FETCH_COMMIT, id });

    const token = getState().getIn(['config','token']);
    let commit = await api(env.apiOrigin + '/commits/' + id, { token });
    dispatch(receiveCommit(commit));
  }
}


export function receiveCommit(data) {
  return {
    type: RECEIVE_COMMIT,
    data
  }
}


export function clearCommit(id) {
  return {
    type: CLEAR_COMMIT,
    id,
  }
}

