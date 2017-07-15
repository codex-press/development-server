import React from 'react';

import './Alert.less';

export default function Alert({
  head = '',
  body = '',
  type = 'info',
  buttons = {},
  dismissable = true,
  remove,
}) {

  const buttonClick = k => e => {
    e.target.disabled = true;
    buttons[k]();
  }

  return (
    <div className={ 'Alert ' + type }>
      { head && <h2>{ head }</h2> }
      { body && <div dangerouslySetInnerHTML={ { __html: body } } /> }
      { Object.keys(buttons).map((b, n) =>
        <button key={ n } onClick={ buttonClick(b) }> { b } </button>)
      }
      { dismissable && 
        <div className="close" onClick={ remove } >&times;</div>
      }
    </div>
  );

}

