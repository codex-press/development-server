import React from 'react';
import { Provider } from 'react-redux'
import { AppContainer } from 'react-hot-loader';

import DevTools from './DevTools';
import store from '../store';
import * as env from '../env'


export default function Root(props) {

  if (env.development) {
    return (
      <AppContainer>
        <Provider store={ store }>
          <div>
            <DevTools />
            { props.children }
          </div>
        </Provider>
      </AppContainer>
    );
  }

  return (
    <Provider store={ store }>
      <div>
        { props.children }
      </div>
    </Provider>
  );

}

