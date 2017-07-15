import React from 'react';
import { shallow } from 'enzyme';

import Repository from './Repository';


const repository = {
  name: "app",
  path: "/Users/omar/code/codex_press/app",
  files: [],
};


test('Renders a Repository', () => {
  expect(shallow(<Repository { ...repository } />)).toMatchSnapshot();
});


test('Can click to expand it', () => {
  const c = shallow(<Repository { ...repository } />)
  c.find('.expand').simulate('click');
  expect(c).toMatchSelector('RepositoryDetails');
});


test('Renders RepositoryEdit', () => {
  const c = shallow(<Repository { ...repository } />)
  c.setState({ editing: true });
  expect(c).toMatchSelector('RepositoryEdit');
});


test.skip('Has a broken prop', () => {

});

