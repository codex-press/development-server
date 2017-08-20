import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { AlertContainer } from './AlertContainer';

test('Renders an alert', () => {
  const alerts = fromJS({
    connection: { id: 'connection', head: 'Lost Connection' }
  });
  expect(shallow(
    <AlertContainer alerts={ alerts } />
  )).toMatchSnapshot();
});


