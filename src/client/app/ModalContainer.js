import React from 'react';

import Dimmer from './Dimmer';

import './ModalContainer.less';

export default function ModalContainer({ children, toggleModal }) {

  return (
    <div className="ModalContainer">
      { children }
      <Dimmer onClick={ () => toggleModal(null) } />
    </div>
  );
}

