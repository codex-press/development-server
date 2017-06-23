import React from 'react'

import { api } from '../utility'

import './LoginPrompt.less';

export default function LoginPrompt(props) {

  let formClass = 'LoginPrompt';
  if (props.status === 'rejected')
    formClass += ' invalid';

  const submit = e => {
    e.preventDefault();
    props.requestToken(
      e.target.querySelector('input[type="email"]').value,
      e.target.querySelector('input[type="password"]').value
    );
  }

  const cancel = e => {
    e.preventDefault();
    props.cancel();
  }

  let buttonClass = 'primary';
  if (props.status === 'pending')
    buttonClass += ' loading';

  return (
    <form className={ formClass } onSubmit ={ submit }>

      <h3>Codex Press Development Server</h3>

      { props.status === 'locked' &&
        <div className="locked">
          Your account is locked. Please wait and use the correct password.
        </div>
      }

      <label>
        Email
        <input type="email" />
      </label>

      <label>
        Password
        <input type="password" />
      </label>

      <div className="button-container">

        { props.cancel &&
          <button onClick={ cancel } >
            Cancel
          </button>
        }

        {' '}

        <button className={ buttonClass }>
          Login
        </button>

      </div>

    </form>
  );
}

