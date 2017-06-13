import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'

import {
  addRepository,
  removeRepository,
  changeRepository,
  setToken
} from '../actions';

import AccountDetails from './AccountDetails';
import Repository from './Repository';
import RepositoryAdd from './RepositoryAdd';

import './Config.less';

const mapStateToProps = state => {
  return {
    config       : state.get('config'),
    repositories : state.get('repositories'),
    account      : state.get('account'),
  }
}


const mapDispatchToProps = {
  addRepository,
  removeRepository,
  changeRepository,
  setToken,
}


export function Config(props) {

  const wheel = e => {
    e.preventDefault();
    e.target.scrollTop += e.deltaY;
  }

  const usedNames = props.repositories.map(a => a.get('name'));

  const changeRepository = (newName, path) => {
    props.changeRepository(name, newName, path) 
  }

  return (
    <div className="Config" onWheel={ wheel }>

      <h2>Codex Press Develepment Server</h2>

      <AccountDetails account={ props.account } />

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
            change={ changeRepository }
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


