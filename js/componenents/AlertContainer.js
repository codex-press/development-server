import React from 'react';
import { connect } from 'react-redux'
import Alert from './Alert';

export default function AlertContainer(props) {

  return (
    <div className="AlertContainer">
      { props.alerts && props.alerts.toArray().map(a =>
        <Alert {...a} key={ a.id } onClick={ () => props.remove(a.id) } />)
      }
    </div>
  );
}




