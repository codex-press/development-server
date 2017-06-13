import { apiOrigin } from './env.js';


export function isLocalhost() {
  return ['localhost','127.0.0.1'].includes(location.hostname);
}


export function api(route, method = 'GET', data, options = {}) {

  let request = { headers: {}, method };

  if (data) {
    request.body = JSON.stringify(data)
    request.headers['Content-Type'] = 'application/json';
  }

  const token = sessionStorage.token;
  if (token && options.auth !== false)
    request.headers['Authorization'] = `Token token="${ token }"`;

  return fetch(`${apiOrigin}/api${route}`, request)
  .then(response => {
    if (response.ok)
      return response.json()
    else
      throw response
  });
}


export function devAPI(route, method = 'GET', data) {

  let request = { method };

  if (data) {
    request.body = JSON.stringify(data)
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
    tag.async = false;
    document.head.appendChild(tag);
    tag.onload = resolve;
    tag.onerror = reject;
  });
}


export function debounce(time, func, context) {
  let timeout = null;
  return (...args) => {
    if (timeout)
      clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), time);
  }
}


export function openFileSystem(path) {
  devAPI(`/open?path=${path}`, 'post');
}



