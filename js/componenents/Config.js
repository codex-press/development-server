import React from 'react';
import { connect } from 'react-redux'

import { setConfig, saveConfig } from '../actions'
import Repository from './Repository'

const mapStateToProps = state => {
  return {
    open : state.getIn(['ui','modal']) === 'config',
    repositories: [],    
    ...state.get('config').toJS(),
  }
}

const mapDispatchToProps = {
  setConfig,
  saveConfig,
}


function ConfigModal(props) {

  if (!props.open)
    return null;

  return (
    <div className="Config">

      <h2>Codex Press Develepment Server</h2>

      <label className={ /[a-f0-9]{64}/.test(props.token) ? '' : 'invalid' }>
        API Token
        <input
          type="text"
          value={ props.api_token || '' }
          onChange={ e => props.setConfig('api_token', e.target.value) } />
      </label>

      <label>
        <input
          type="checkbox"
          checked={ props.allow_external || false }
          onChange={ e => props.setConfig('allow_external', e.target.checked) } />
        Allow connections from other hosts
      </label>

      { props.repositories.map(r => 
        <Repository />)
      }

      <button onClick={ props.saveConfig }>Save</button>

    </div>
  );

}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfigModal);


