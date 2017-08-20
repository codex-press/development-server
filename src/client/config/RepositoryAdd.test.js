import React from 'react';
import { shallow } from 'enzyme';

import RepositoryAdd from './RepositoryAdd';


test('Renders a RepositoryAdd button', () => {
  expect(shallow(<RepositoryAdd />)).toMatchSnapshot();
});


test('Renders a RepositoryEdit form', () => {
  const c = shallow(<RepositoryAdd />)
  c.find('button').simulate('click');
  expect(c).toMatchSelector('RepositoryEdit');
});


