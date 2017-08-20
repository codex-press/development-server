import React from 'react';


export default function AccountDetails(props) {

  if (!props.account)
    return <div>Loading account...</div>;

  let homeUrl = (
    'https://codex.press' + props.account.get('root_directory_url')
  );

  return (
    <div className="AccountDetails">

      <div>Logged in as { props.account.get('name') }</div>
      <div>{ props.account.get('email') }</div>
      <div><a href={ homeUrl } target="_blank">{ homeUrl }</a></div>
      <button className="small" onClick={ props.change }>
        Change Account
      </button>
    </div>
  )

}


