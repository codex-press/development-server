import React from 'react';
import { connect } from 'react-redux'

import { isLocalhost } from '../utility';

import { toggleModal, requestToken, setTokenStatus } from '../actions';

import LoginPrompt from './LoginPrompt';
import AlertContainer from './AlertContainer';
import Nav from './Nav.js';
import Modal from './Modal';
import Dimmer from './Dimmer';

const mapStateToProps = state => {
  return {
    ui     : state.get('ui'),
    config : state.get('config'),
  }
}


const mapDispatchToProps = {
  toggleModal,
  requestToken,
  setTokenStatus,
}


export function App(props) { 

  if (!props.config)
    return null;

  if (!isLocalhost()) {
    return (
      <div className="App">
        <AlertContainer />
      </div>
    );
  }

  // allow cancel if there is an existing token
  let cancelLogin;
  if (props.token)
    cancelLogin = () => props.setTokenStatus('valid');

  if (props.ui.get('token_status') !== 'valid') {
    return (
      <div className="App">
        <AlertContainer />
        <LoginPrompt
          status={ props.ui.get('token_status') }
          requestToken={ props.requestToken }
          cancel={ cancelLogin }
        />
        <Dimmer />
      </div>
    );
  }

  // normal state with the appropriate modal shown
  const removeModal = () => props.toggleModal(null);

  return (
    <div className="App">
      <AlertContainer />
      <Nav />
      <Modal which={ props.ui.get('modal') } />
      { props.ui.get('modal') && <Dimmer onClick={ removeModal } /> }
    </div>
  );

}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);


