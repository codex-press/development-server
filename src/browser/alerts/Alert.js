import React from 'react';

import './Alert.less';

export default function Alert({
  head = '',
  body = '',
  type = '',
  dismissable = true,
  buttons = {},
  remove,
}) {

  const buttonClick = k => e => {
    e.target.disabled = true;
    buttons[k]();
  }

  return (
    <div className={ 'Alert ' + type }>
      { dismissable && 
        <div className="close" onClick={ remove } >&times;</div>
      }
      { head && <h2>{ head }</h2> }
      { body && <div dangerouslySetInnerHTML={ { __html: body } } /> }
      { Object.keys(buttons).map((b, n) =>
        <button key={ n } onClick={ buttonClick(b) }> { b } </button>)
      }
    </div>
  );

}

