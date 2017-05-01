import { apiOrigin } from './env.js';
import { getKey } from './index.js';


export function isLocalhost() {
  return ['localhost','127.0.0.1','::1'].includes(location.hostname);
}


export function api(route, data) {

  let request = {headers: {}}
  
  if (typeof data === 'string') {
    request.method = data.toUpperCase();
  }
  else if (data) {
    let key = Object.keys(data)[0];
    request.method = key.toUpperCase();
    request.body = JSON.stringify(data[key])
    request.headers['Content-Type'] = 'application/json';
  }

  if (!(data && data.auth === false))
    request.headers['Authorization'] = `Token token="${getKey()}"`;

  return fetch(`${apiOrigin}/api${route}`, request)
  .then(response => {
    if (response.ok)
      return response.json()
    else
      throw response
  });
}


export function devAPI(route, data) {

  let request = {};

  if (typeof data === 'string') {
    request.method = data.toUpperCase();
  }
  else if (data) {
    let key = Object.keys(data)[0];
    request.method = key.toUpperCase();
    request.body = JSON.stringify(data[key])
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

