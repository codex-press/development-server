import React from 'react';


export default function AccountDetails(props) {

  if (!props.account)
    return <div>Loading account...</div>;

  let homeURL = (
    'https://codex.press' + props.account.get('rootDirectoryURL')
  );

  return (
    <div className="AccountDetails">

      <div>Logged in as { props.account.get('name') }</div>
      <div>{ props.account.get('email') }</div>
      <div><a href={ homeURL } target="_blank">{ homeURL }</a></div>
      <button className="small" onClick={ props.change }>
        Change Account
      </button>
    </div>
  )

}


