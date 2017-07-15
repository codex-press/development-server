import React from 'react';
import { shallow } from 'enzyme';

import { Nav } from './Nav';


test('Renders a Nav', () => {
  expect(shallow(<Nav />)).toMatchSnapshot();
});


test('Clicking the Info icon toggles the modal', () => {
  const toggleModal = jest.fn();
  const c = shallow(<Nav toggleModal={ toggleModal } />);
  c.find('IconInfo').simulate('click');
  expect(toggleModal.mock.calls.length).toBe(1);
  expect(toggleModal.mock.calls[0][0]).toBe('info');
});


test('Clicking the Search icon toggles the modal', () => {
  const toggleModal = jest.fn();
  const c = shallow(<Nav toggleModal={ toggleModal } />);
  c.find('IconSearch').simulate('click');
  expect(toggleModal.mock.calls.length).toBe(1);
  expect(toggleModal.mock.calls[0][0]).toBe('search');
});


test('Clicking the Config icon toggles the modal', () => {
  const toggleModal = jest.fn();
  const c = shallow(<Nav toggleModal={ toggleModal } />);
  c.find('IconConfig').simulate('click');
  expect(toggleModal.mock.calls.length).toBe(1);
  expect(toggleModal.mock.calls[0][0]).toBe('config');
});


test('Clicking the Edit icon opens the window', () => {
  global.open = jest.fn();
  global.location = { pathname: '/hey' };
  const c = shallow(<Nav />);
  c.find('IconEdit').simulate('click');
  expect(global.open.mock.calls.length).toBe(1);
  expect(global.open.mock.calls[0][0]).toBe(
    'https://codex.press/edit/article' +
    window.location.pathname
  );
});


test('Clicking more than once does not toggle again', () => {
  const toggleModal = jest.fn();
  const c = shallow(<Nav toggleModal={ toggleModal } />);
  c.find('IconInfo').simulate('click');
  c.find('IconInfo').simulate('click');
  c.find('IconInfo').simulate('click');
  c.find('IconInfo').simulate('click');
  expect(toggleModal.mock.calls.length).toBe(1);
});



