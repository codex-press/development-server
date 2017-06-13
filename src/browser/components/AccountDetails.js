import React from 'react';

import ConfigLoginPrompt from './ConfigLoginPrompt';

export default class AccountDetails extends React.Component {


  constructor(props) {
    super(props);
    this.state = { changing: false };
  }



  render() {
    if (!this.props.account)
      return <div>Loading...</div>;

    let homeUrl = (
      'https://codex.press' + this.props.account.get('root_directory_url')
    );

    if (this.state.changing)
      return <ConfigLoginPrompt setToken={ t => this.setToken(t) } />;

    return (
      <div className="account-details">
        <div>Logged in as { this.props.account.get('name') }</div>
        <div>{ this.props.account.get('email') }</div>
        <div><a href={ homeUrl } target="_blank">{ homeUrl }</a></div>
        <button 
          className="small"
          onClick={ () => this.setState({ changing: true }) }>
          Change Account
        </button>
      </div>
    )

  }


  setToken(token) {
    this.props.setToken(token);
    this.setState({ changingLogin: false });
  }

}


