
let origin = 'http://localhost';

export function api(route) {

  let request = {}
  
  let key = "43a938d5b538acedc6d3c3a0ed42f5fb6e3f616bb60625c406ed98e323902cb3"

  request.headers = {
    Authorization: `Token token="${key}"`,
  }

  return fetch(`${origin}/api${route}`, request)
  .then(response => {
    if (response.ok)
      return response.json()
    else
      throw response
  });

}


