import React from 'react';
import { shallow } from 'enzyme';
import { Map } from 'immutable';

import { AlertContainer } from './AlertContainer';

test('Renders an alert', () => {
  const alerts = Map({
    connection: { id: 'connection', head: 'Lost Connection' }
  });
  expect(shallow(
    <AlertContainer alerts={ alerts } />
  )).toMatchSnapshot();
});


