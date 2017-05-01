import React from 'react';
import { connect } from 'react-redux'

import { addRepo, removeRepo, updateRepo, setToken } from '../actions';

import { api } from '../utility'

import { IconValid, IconInvalid } from './icons';

import Repository from './Repository';
import RepositoryAdd from './RepositoryAdd';


const mapStateToProps = state => {
  return {
    ...state.get('config').toObject(),
    open           : state.getIn(['ui','modal']) === 'config',
    repositoryList : state.get('repositories').toJS(),    
    account        : state.get('account') && state.get('account').toObject(),
  }
}


const mapDispatchToProps = {
  addRepo,
  removeRepo,
  updateRepo,
  setToken,
}


class ConfigModal extends React.Component {


  constructor() {
    super();
    this.state = { addRepo: false, };
  }


  render() {
    
    if (!this.props.open)
      return null;

    let homeUrl;
    if (this.props.account) {
      homeUrl = 'https://codex.press' + this.props.account.root_directory_url;
    }

    return (
      <div 
        className="Config"
        ref={ el => this.topEl = el }
        onWheel={ e => this.wheel(e) }>

        <h2>Codex Press Develepment Server</h2>

        { this.props.account && !this.state.changingLogin &&
          <div className="account-details">
            <div>Logged in as { this.props.account.name }</div>
            <div>{ this.props.account.email }</div>
            <div><a href={ homeUrl } target="_blank">{ homeUrl }</a></div>
            <button 
              className="small"
              onClick={ () => this.setState({changingLogin: true}) }>
              Change Account
            </button>
          </div>
        }

        { this.state.changingLogin &&
          <form 
            className={ this.state.invalidLogin ? 'invalid' : '' }
            onSubmit={ e => this.changeLogin(e) } >

            <label>
              Email
              <input type="email" />
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
        }

        <h3>Repositories</h3>

        <a href="https://codex.press/edit/repos" target="_blank">
          View on production
        </a>

        { this.props.repositories.size === 0 ?

          <div className="empty">No repositories!</div> :

          this.props.repositories.map((repo, name) => 
            <Repository
              key={ name }
              { ...repo.toJS() }
              remove={ () => this.props.removeRepo(name) }
              files={
                this.props.repositoryList[name] &&
                this.props.repositoryList[name].files ||
                []
              }
              change={ (newName, path) => {
                this.props.updateRepo(name, newName, path) 
              } }
              checkName={ name => this.checkName(name) }
            />
          ).toArray()
        }

        <RepositoryAdd
          submit={ (name, path) => this.props.addRepo(name, path) }
          checkName={ name => this.checkName(name) }
        />

      </div>
    );
  }


  changeLogin(e) {
    e.preventDefault();
    let email = e.target.querySelector('[type="email"]').value;
    let password = e.target.querySelector('[type="password"]').value;
    api('/login', {post: {email, password}, auth: false})
    .then(data => {
      this.setState({changingLogin: false})
      this.props.setToken(data.token);
    })
    .catch(data => this.setState({invalidLogin: true}));
  }


  wheel(e) {
    this.topEl.scrollTop += e.deltaY;
    e.preventDefault();
  }


  checkName(name) {
    return (
      name.length > 1 &&
      !/[^\w-]/.test(name) &&
      !this.props.repositories.has(name)
    );
  }

}



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfigModal);


