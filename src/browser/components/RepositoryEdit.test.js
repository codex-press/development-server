import React from 'react';
import { shallow } from 'enzyme';

import RepositoryEdit from './RepositoryEdit';

test('Renders a RepositoryEdit form', () => {
  expect(shallow(<RepositoryEdit name="meh" path="/code" />)).toMatchSnapshot();
});


test('Shows an invalid name', () => {
  const c = shallow(<RepositoryEdit name="dude" />);
  c.find('input[name="name"]').simulate('change', { target: { value: 'm' } });
  expect(c.find('IconInvalid')).toBePresent();
});


test('Shows an invalid path', () => {
  //expect(shallow(<RepositoryEdit />)).toMatchSnapshot();
});


test('Submits changes', () => {
  //expect(shallow(<RepositoryEdit />)).toMatchSnapshot();
});


test('Does not submit invalid change', () => {
  //expect(shallow(<RepositoryEdit />)).toMatchSnapshot();
});


test('Pasting a path adds its name', () => {
  //  expect(shallow(<RepositoryEdit />)).toMatchSnapshot();
});


