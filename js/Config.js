import React, {Component} from 'react';

import ConfigModal from './ConfigModal';


export default class Config extends Component {

  render() {
    return (
      <div className="Config">

        <link rel="stylesheet" href="/main.css" />

        <div className="dimmer"></div>

        <ConfigModal />
      </div>
    );
  }

}


