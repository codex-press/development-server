import React from 'react';
import { connect } from 'react-redux'

import { isLocalhost } from '../utility';

import { toggleModal } from '../actions';

import LoginPrompt from './LoginPrompt';
import AlertContainer from './AlertContainer';
import Nav from './Nav.js';
import Modal from './Modal';
import Dimmer from './Dimmer';

const mapStateToProps = state => {
  return {
    loaded: !!state.get('config'),
    modal: state.getIn(['ui','modal']),
    invalidToken: state.getIn(['ui','invalid_token']),
  }
}


const mapDispatchToProps = {
  toggleModal,
}


export function App(props) { 

  if (!props.loaded)
    return null;

  if (!isLocalhost()) {
    return (
      <div className="App">
        <AlertContainer />
      </div>
    );
  }

  if (props.invalidToken) {
    return (
      <div className="App">
        <AlertContainer />
        <LoginPrompt submit={ token => props.setToken(token) } />
        <Dimmer />
      </div>
    );
  }

  return (
    <div className="App">
      <AlertContainer />
      <Nav />
      <Modal which={ props.modal } />
      { props.modal && <Dimmer onClick={ () => props.toggleModal(null) } /> }
    </div>
  );

}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);


