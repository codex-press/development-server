import React from 'react';
import { connect } from 'react-redux'

import { removeAlert } from '../actions';
import Alert from './Alert';

import './AlertContainer.less';


const mapStateToProps = state => {
  return {
    alerts: state.get('alerts'),
  }
}


const mapDispatchToProps = {
  removeAlert,
}



export function AlertContainer(props) {

  return (
    <div className="AlertContainer">
      { props.alerts.toArray().map(a =>
        <Alert
          {...a.toJS()}
          key={ a.get('id') }
          remove={ () => props.removeAlert(a.get('id')) }
        />)
      }
    </div>
  );
}


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AlertContainer);


