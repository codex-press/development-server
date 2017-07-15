

export const SET_BUILD_OUTPUT_MINIMAL = 'SET_BUILD_OUTPUT_MINIMAL';
export const CLEAR_COMMITS = 'CLEAR_COMMITS';


export function setBuildOutputMinimal(value) {
  return {
    type: SET_BUILD_OUTPUT_MINIMAL,
    value,
  }
}


export function clearCommits() {
  return {
    type: CLEAR_COMMITS,
  }
}

