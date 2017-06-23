import React from 'react';

export default function Impersonate(props) {

  if (!props.account || !props.account.get('impersonator'))
    return null;

  return (
    <div className="impersonate">
      Impersonate: {}
      <select
        onChange={ e => props.impersonate(e.target.value) } 
        value={ props.account.get('id') }>
        { props.users.toArray().map(u =>
          <option key={ u.get('id') } value={ u.get('id') }>
            { u.get('email') }
          </option>)
        }
      </select>
    </div>
  )

}

