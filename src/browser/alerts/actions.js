

export const ADD_ALERT = 'ADD_ALERT';
export const REMOVE_ALERT = 'REMOVE_ALERT';

let timeouts = {};
export var lastAlertID = 0;
export function addAlert(attrs) {
  return dispatch => {

    if (typeof data === 'string')
      attrs = { body: attrs };

    attrs = {
      id: lastAlertID++,
      dismissable: true,
      type: 'info',
      timeout: 5000,
      ...attrs,
    }

    if (attrs.timeout) {
      attrs.timeoutID = setTimeout(
        () => dispatch(removeAlert(attrs.id)),
        attrs.timeout
      );
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



