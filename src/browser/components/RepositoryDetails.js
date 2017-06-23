import React from 'react';

import { openFileSystem } from '../utility';


export default function RepositoryDetails(props) { 

  let open = path => openFileSystem(props.path + '/' + path);

  return (
    <div className="Repository">

      <h4 className="name">{ props.name }</h4>

      <div className="path" onClick={ () => openFileSystem(props.path) }>
        { props.path }
      </div>

      <div className="collapse" onClick={ props.collapse }>
        see less
      </div>

      <button onClick={ props.remove }>Remove</button>
      {' '}
      <button onClick={ props.edit }>Edit</button>

      <ul>
        { props.files.map(f => 
          <li key={ f.filename }>
            { f.filename + ' ' }
            <span className="open" onClick={ () => open(f.filename) }>(open)</span>
          </li>)
        }
      </ul>

    </div>
  );
}


