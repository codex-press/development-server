import React from 'react';
import { connect } from 'react-redux'

import { isLocalhost } from '../utility';

import Config from './Config';
import LoginPrompt from './LoginPrompt';
import Search from './Search';
import Info from './Info';
import AlertContainer from './AlertContainer';
import { IconInfo, IconEdit, IconSearch, IconConfig } from './icons';

import {
  styleLoadComplete,
  toggleModal,
  removeAlert,
  setToken,
} from '../actions';


const mapStateToProps = state => {
  return {
    invalid_token: state.getIn(['ui','invalid_token']),
    loaded: state.getIn(['ui','style_loaded']),
    alerts: state.get('alerts'),
    modal: state.getIn(['ui','modal']),
    article: state.get('article').toJS(),
  }
}



const mapDispatchToProps = {
  styleLoadComplete,
  toggleModal,
  removeAlert,
  setToken,
}



class App extends React.Component {


  constructor(props) {
    super();
    this.windowKey = this.windowKey.bind(this);
    this.focusHandler = this.focusHandler.bind(this);
    this.state = { focus: document.hasFocus() };
  }


  render() {

    const hidden = { display: 'none' };
    const props = this.props;

    return (
      <div className={ 'App ' + (this.state.focus ? ' focused' : '') }
        style={ props.loaded ? null : hidden }>

        <link ref={el => this.styleEl = el} rel="stylesheet" href="/main.css" />

        <AlertContainer alerts={ props.alerts } remove={ props.removeAlert } />

        { isLocalhost() &&
          <div>
            <nav>
              <IconInfo onClick={ () => this.toggleModal('info') } />
              <IconEdit onClick={ () => this.openEdit() } />
              <IconSearch onClick={ () => this.toggleModal('search') } />
              <IconConfig onClick={ () => this.toggleModal('config') } />
            </nav>

            { this.props.invalid_token &&
              <LoginPrompt submit={ token => this.props.setToken(token) } />
            }

            <Info open={ props.modal === 'info' } {...props.article} />
            <Search />
            <Config />

            { props.modal &&
              <div className="dimmer" onClick={ () => this.toggleModal(null) }/>
            }
          </div>
        }

      </div>
    );
  }


  componentDidMount() {
    this.styleEl.addEventListener('load', this.props.styleLoadComplete);
    window.addEventListener('keydown', this.windowKey);
    window.addEventListener('focus', this.focusHandler);
    window.addEventListener('blur', this.focusHandler);
  }


  componentWillUnmount() {
    window.removeEventListener('keydown', this.windowKey);
    window.removeEventListener('focus', this.focusHandler);
    window.removeEventListener('blur', this.focusHandler);
  }


  openEdit() {
    const editUrl = 'https://codex.press/edit/article' + location.pathname;
    window.open(editUrl, '_blank');
  }


  focusHandler(e) {
    this.setState({focus: document.hasFocus()});
  }


  toggleModal(value) {
    // don't want to let a double click open and then close it
    if (performance.now() - this.lastToggle < 500)
      return;
    this.props.toggleModal(value);
    this.lastToggle = performance.now();
  }


  windowKey(e) {

    if (e.key === 'Escape') {
      e.preventDefault();
      this.props.toggleModal(null);
    }
    else if (e.path[0].tagName === 'INPUT' || e.defaultPrevented || e.metaKey ||
             e.ctrlKey || e.altKey) {
      return;
    }
    else if (e.key === 'f') {
      e.preventDefault();
      this.props.toggleModal('search');
    }
    else if (e.key === 'i') {
      e.preventDefault();
      this.props.toggleModal('info');
    }
    else if (e.key === 'c') {
      e.preventDefault();
      this.props.toggleModal('config');
    }

  }


}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

