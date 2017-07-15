import React from 'react';
import { connect } from 'react-redux'

import { isLocalhost } from '../utility';

import { toggleModal, requestToken, setTokenStatus } from '../actions';

import AlertContainer from '../alerts/AlertContainer';
import BuildOutput from '../commits/BuildOutput';
import LoginPrompt from './LoginPrompt';
import Nav from './Nav';
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

  if (!props.ui.get('token_status'))
    return null;

  if (!isLocalhost) {
    return (
      <div className="App">
        <AlertContainer />
      </div>
    );
  }

  if (props.ui.get('token_status') !== 'valid') {
    return (
      <div className="App">
        <AlertContainer />
        <LoginPrompt
          status={ props.ui.get('token_status') }
          requestToken={ props.requestToken }
          cancel={ props.token ? () => props.setTokenStatus('valid') : null }
        />
        <Dimmer />
      </div>
    );
  }

  return (
    <div className="App">
      <AlertContainer />
      <Nav />
      <BuildOutput />
      <Modal which={ props.ui.get('modal') } />
      { props.ui.get('modal') &&
        <Dimmer onClick={ () => props.toggleModal(null) } />
      }
    </div>
  );

}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);


