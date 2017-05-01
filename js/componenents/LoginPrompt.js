import React from 'react'

import { api } from '../utility'


export default class LoginPrompt extends React.Component {

  constructor() {
    super();
    this.state = {};
  }


  render() {
    return (
      <form 
        className={ 'LoginPrompt' + (this.state.invalid ? ' invalid' : '') }
        onSubmit ={ e => this.submit(e) }>

        <h3>Codex Press Development Server</h3>

        <label>
          Email
          <input type="email" />
        </label>

        <label>
          Password
          <input type="password" />
        </label>

        <div className="button-container">
          <button type="submit" className="primary">
            Login
          </button>
        </div>

      </form>
    );
  }


  submit(e) {
    e.preventDefault();
    let email = e.target.querySelector('[type="email"]').value;
    let password = e.target.querySelector('[type="password"]').value;
    api('/login', {post: {email, password}})
    .then(data => this.props.submit(data.token))
    .catch(data => this.setState({invalid: true}));
  }


}
