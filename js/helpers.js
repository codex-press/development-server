
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

export function addStylesheet(url, attrs = {}) {
  return new Promise((resolve, reject) => {
    let tag = document.createElement('link');
    tag.setAttribute('rel', 'stylesheet');
    Object.keys(attrs).map(k => tag.setAttribute(k, attrs[k]));
    tag.href = url;
    document.head.appendChild(tag);
    tag.onload = resolve;
    tag.onerror = reject;
  });
}

export function addScript(url, attrs = {}) {
  return new Promise((resolve, reject) => {
    let tag = document.createElement('script');
    Object.keys(attrs).map(k => tag.setAttribute(k, attrs[k]));
    tag.src = url;
    document.head.appendChild(tag);
    tag.onload = resolve;
    tag.onerror = reject;
  });
}

