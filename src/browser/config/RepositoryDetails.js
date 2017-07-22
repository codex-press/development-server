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

      <table>
        <thead>
          <tr>
            <th>Filename</th>
            <th>Path</th>
          </tr>
        </thead>
        <tbody>
          { props.files.map(f => 
            <tr key={ f.filename }>
              <td>
                <span className="open" onClick={ () => open(f.filename) }>
                  { f.filename + ' ' }
                </span>
              </td>
              <td>
                <a target="_blank" href={ f.path }>
                  { f.path }
                </a>
              </td>
            </tr>)
          }
        </tbody>
      </table>

    </div>
  );
}


