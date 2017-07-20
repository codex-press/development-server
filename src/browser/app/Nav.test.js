import React from 'react';
import { shallow } from 'enzyme';
import { Map } from 'immutable';

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


test('Clicking the Edit icon opens editor with permission', () => {
  global.open = jest.fn();
  global.location = { pathname: '/hey' };
  const c = shallow(
    <Nav
      account={ Map({ id: 'me' }) }
      article={ Map({ account_id: 'me', url: '/newsy' }) }
    />
  );
  c.find('IconEdit').simulate('click');
  expect(global.open.mock.calls.length).toBe(1);
  let expected = 'https://codex.press/edit/article/newsy';
  expect(global.open.mock.calls[0][0]).toBe(expected);
});


test('Clicking the Edit icon opens editor without permssion', () => {
  global.open = jest.fn();
  global.location = { pathname: '/hey' };
  const c = shallow(
    <Nav account={ Map({ id: 'me' }) } article={ Map({ account_id: 'you' }) } />
  );
  c.find('IconEdit').simulate('click');
  expect(global.open.mock.calls.length).toBe(1);
  expect(global.open.mock.calls[0][0]).toBe('https://codex.press/edit');
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



