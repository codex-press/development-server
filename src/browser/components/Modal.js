import React from 'react';

import Config from './Config';
import Search from './Search';
import Info from './Info';

export default function Modal(props) {

  switch (props.which) {
    case 'search':
      return <Search />;
    case 'config':
      return <Config />;
    case 'info':
      return <Info />;
    default:
      return null;
  }

}

