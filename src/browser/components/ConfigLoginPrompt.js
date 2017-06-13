import React from 'react';

import { api } from '../utility'

import './ConfigLoginPrompt.less';

export default class ConfigLoginPrompt extends React.Component {
 
  constructor(props) {
    super(props);
    this.state = { invalidLogin: false, };
  }


  render() {

    let className = 'ConfigLoginPrompt'
    if (this.state.invalidLogin) className += ' invalid';

    return (
      <form className={ className } onSubmit={ e => this.submit(e) } >

        <label>
          Email
          <input type="email" autoFocus />
        </label>

        <label>
          Password
          <input type="password" />
        </label>

        <button
          type="button"
          onClick={ () => this.setState({changingLogin: false}) } >
          Cancel
        </button>

        {' '}

        <button type="submit" className="primary">
          Change
        </button>

      </form>
    );

  }


  submit(e) {
    e.preventDefault();
    let email = e.target.querySelector('[type="email"]').value;
    let password = e.target.querySelector('[type="password"]').value;
    api('/login', 'post', { email, password }, { auth: false })
    .then(data => {
      this.setState({ invalidLogin: false });
      this.props.setToken(data.token);
    })
    .catch(data => {
      this.setState({ invalidLogin: true })
    });
  }

}


