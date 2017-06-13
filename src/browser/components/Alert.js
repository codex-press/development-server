import React from 'react';

import './Alert.less';

export default function Alert({
  head = '',
  body = '',
  type = 'info',
  remove
}) {

  return (
    <div className={ 'Alert ' + type } onClick={ remove } >
      { head && <h2>{ head }</h2> }
      { body && <div dangerouslySetInnerHTML={ { __html: body } } /> }
    </div>
  );

}

