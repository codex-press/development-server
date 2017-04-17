import React from 'react';

export default function Alert({
  head = '',
  body = '',
  pre = '',
  type = 'info',
  onClick
}) {
  return (
    <div className={ 'Alert ' + type } onClick={ onClick } >

      { head && <h2>{ head }</h2> }

      { body.split('\n').map((line, k) => <div key={ k }>{ line }</div>) }

      { pre && <pre>{ pre }</pre> }

    </div>
  );
}

