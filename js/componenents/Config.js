import React, {Component} from 'react';
import { connect } from 'react-redux'

import { setToken, saveConfig } from '../actions'

const mapStateToProps = state => {
  return {
    open: state.getIn(['ui','modal']) == 'config',
    token: state.getIn(['config','token']) || '',
  }
}

const mapDispatchToProps = {
  setToken,
  saveConfig,
}


function ConfigModal(props) {

  if (!props.open)
    return null;

  return (
    <div className="Config">

      <h2>Codex Develepment Server</h2>

      <label className={ /[a-f0-9]{64}/.test(props.token) ? '' : 'invalid' }>
        API Token
        <input
          name="token"
          value={ props.token }
          onChange={ e => props.setToken(e.target.value) } />
      </label>

      <button onClick={ props.saveConfig }>Save</button>

    </div>
  );

}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfigModal);


