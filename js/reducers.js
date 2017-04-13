
function rootReducer(state = initialState, action) {

  switch (action.type) {
    case 'SET_TOKEN':
      return state.set('token', action.value);
    case 'SET_REPO_PATH':
      return state.set('repo_path', action.value);
    case 'SYNC':
      sync();
      return state;
    default:
      return state;
  }

}

function sync() {
  fetch('/api/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(store.getState()),
  })
  .then(response => response.json())
  .then(data => console.log(data))
}
