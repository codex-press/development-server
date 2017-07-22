import ReactDOMServer from 'react-dom/server';


export const ADD_ALERT = 'ADD_ALERT';
export const REMOVE_ALERT = 'REMOVE_ALERT';

let timeouts = {};
export var lastAlertID;
export function addAlert(attrs) {
  return dispatch => {

    if (typeof data === 'string')
      attrs = { body: attrs };

    attrs = {
      id: Math.random(),
      timeout: 5000,
      ...attrs,
    }

    if (attrs.timeout) {
      attrs.timeoutID = setTimeout(
        () => dispatch(removeAlert(attrs.id)),
        attrs.timeout
      );
    }

    // change react to a component
    if (typeof attrs.body == 'function') {
      attrs.body = ReactDOMServer.renderToStaticMarkup(attrs.body());
    }

    dispatch({
      type: ADD_ALERT,
      attrs,
    });

    return attrs;
  }
}


export function removeAlert(id) {
  return {
    type: REMOVE_ALERT,
    id,
  };
}



