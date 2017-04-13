import React, {Component} from 'react';
import { connect } from 'react-redux'

import ConfigModal from './ConfigModal';

import { styleLoaded } from './actions';

const mapStateToProps = state => {
  return {
  }
}

const mapDispatchToProps = {
  styleLoaded,
}


function Config(props) {

  return (
    <div className="Config">

      <link onLoad={ props.styleLoaded } rel="stylesheet" href="/main.css" />

      <div className="dimmer"></div>

      <ConfigModal />

    </div>
  );

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Config);

