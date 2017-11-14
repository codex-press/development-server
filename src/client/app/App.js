import React from 'react';
import { connect } from 'react-redux'

import { isLocalhost } from '../utility';

import { toggleModal, requestToken, setTokenStatus } from '../actions';

import AlertContainer from '../alerts/AlertContainer';
import BuildOutput from '../commits/BuildOutput';
import LoginPrompt from './LoginPrompt';
import Nav from './Nav';
import ModalContainer from './ModalContainer';
import Dimmer from './Dimmer';
import Config from '../config/Config';
import Search from '../search/Search';
import Info from './Info';

const mapStateToProps = state => {
  return {
    ui      : state.get('ui'),
    config  : state.get('config'),
  }
}


const mapDispatchToProps = {
  toggleModal,
  requestToken,
  setTokenStatus,
}


export function App(props) {

  if (!props.ui.get('tokenStatus'))
    return null;

  if (!isLocalhost) {
    return (
      <div className="App">
        <AlertContainer />
      </div>
    );
  }

  if (props.ui.get('tokenStatus') !== 'valid') {
    return (
      <div className="App">
        <AlertContainer />
        <ModalContainer>
          <LoginPrompt
            status={ props.ui.get('tokenStatus') }
            requestToken={ props.requestToken }
            cancel={ props.token ? () => props.setTokenStatus('valid') : null }
          />
        </ModalContainer>
      </div>
    );
  }

  if (props.ui.get('modal')) {
    return (
      <div className="App">
        <BuildOutput />
        <ModalContainer toggleModal={ props.toggleModal } >
          <Search />
          <Config />
          <Info />
        </ModalContainer>
        <AlertContainer />
        <Nav />
      </div>
    );
  }

  return (
    <div className="App">
      <BuildOutput />
      <AlertContainer />
      <Nav />
    </div>
  );
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);


