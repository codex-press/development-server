import React from 'react';

import { IconInvalid } from '../app/icons';

export default function RepositoryBroken(props) {

  return (
    <div className="Repository RepositoryBroken">

      <h4 className="name">
        { props.name + ' ' }
        <IconInvalid />
      </h4>

      <div className="path">
        Not found: { props.path }
      </div>

      <button onClick={ props.edit }>Edit</button>
      {' '}
      <button onClick={ props.remove }>Remove</button>

    </div>
  );
}

