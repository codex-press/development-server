

// Use like api('/articles', {post: data})
export function api(route, data) {

  let request = {credentials: 'same-origin'}

  if (typeof data === 'string') {
    request.method = data.toUpperCase();
  }
  else if (data) {
    request.method = Object.keys(data)[0].toUpperCase();
    request.body = JSON.stringify(data[Object.keys(data)[0]])
    request.headers = {'Content-Type': 'application/json'}
  }

  return fetch(`/api${route}`, request)
  .then(response => {
    if (response.ok)
      return response.json()
    else
      throw response
  });
}


