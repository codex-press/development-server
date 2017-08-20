import React from 'react';

import './Alert.less';

export default function Alert({
  body,
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

      <div dangerouslySetInnerHTML={ { __html: body } } />

    </div>
  );

}

