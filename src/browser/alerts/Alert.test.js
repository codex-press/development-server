import React from 'react';
import { shallow } from 'enzyme';

import Alert from './Alert';

test('Renders an alert', () => {
  expect(shallow(
    <Alert
      head="heading"
      body="<li>body</li>"
      type="info"
    />
  )).toMatchSnapshot();
});


test('Calls remove function onClick', () => {
  const remove = jest.fn();
  let c = shallow(<Alert remove={ remove } />);
  c.find('.close').simulate('click');
  expect(remove.mock.calls.length).toBe(1);
});


