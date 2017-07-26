import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'

import {
  addRepository,
  removeRepository,
  changeRepository,
  setTokenStatus,
  impersonate,
  changeConfig,
  reload,
  navigate,
} from '../actions';

import AccountDetails from './AccountDetails';
import Repository from './Repository';
import RepositoryAdd from './RepositoryAdd';
import Impersonate from './Impersonate'; 

import './Config.less';


const mapStateToProps = state => {
  return {
    visible: state.getIn(['ui', 'modal']) === 'config',
    config: state.get('config'),
    ui: state.get('ui'),
    repositories: state.get('repositories'),
    domains: state.get('domains'),
    account: state.get('account'),
    users: state.get('users'),
  }
}


const mapDispatchToProps = {
  addRepository,
  removeRepository,
  changeRepository,
  setTokenStatus,
  impersonate,
  changeConfig,
  reload,
  navigate,
}


export function Config(props) {

  if (!props.visible)
    return null;

  const usedNames = props.repositories.toArray().map(a => a.get('name'));

  const changeRepository = name => (newName, path) => {
    props.changeRepository(name, newName, path) 
  }

  const changeCSP = e => {
    props.changeConfig('disable_csp', e.target.checked)
    props.reload();
  }

  const changeDomain = async e => {
    let value = e.target.value === "None" ? '' : e.target.value;
    await props.changeConfig('domain', value)
    props.navigate('/');
  }

  return (
    <div className="Config">

      <h2>Codex Press Develepment Server</h2>

      <Impersonate
        account={ props.account }
        users={ props.users }
        impersonate={ props.impersonate }
      />

      <AccountDetails
        account={ props.account }
        change={ () => props.setTokenStatus('changing') }
      />

      <label className="for-checkbox">
        <input
          type="checkbox"
          checked={ !!props.config.get('disable_csp') }
          onChange={ changeCSP }
        />
        Disable the Content Security Policy {}
        <a target="_blank" href="https://codex.press/docs/dev-server#csp">
          (help)
        </a>
      </label>

      { props.domains.size > 0 &&
        <label>
          Domain: {}
          <select
            value={ props.config.get('domain') }
            onChange={ changeDomain }>
            <option>None</option>
            { props.domains.map(d =>
              <option key={ d.get('id') }>
                { d.get('name') }
              </option>)
            }
          </select>
        </label>
      }

      <h3>Repositories</h3>

      <a href="https://codex.press/edit/repos" target="_blank">
        View on production
      </a>

      { props.repositories.size === 0 ?

        <div className="empty">No repositories!</div> :

        props.repositories.map((repo, name) => 
          <Repository
            key={ name }
            { ...repo.toJS() }
            remove={ () => props.removeRepository(name) }
            change={ changeRepository(name) }
            usedNames={ usedNames }
          />
        ).toArray()
      }

      <RepositoryAdd
        submit={ (name, path) => props.addRepository(name, path) }
        usedNames={ usedNames }
      />

    </div>
  );

}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Config);


