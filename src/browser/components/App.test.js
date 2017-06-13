import React from 'react';
import { shallow } from 'enzyme';

import * as utility from '../utility';
import { App } from './App';
import LoginPrompt from './LoginPrompt';


test('Renders nothing when it is loading', () => {
  expect(shallow(<App />).debug()).toHaveLength(0);
});


test('Renders only alert container when not on localhost', () => {
  utility.isLocalhost = () => false;
  const c = shallow(<App loaded={ true } />);
  expect(c.find('LoginPrompt')).toBeEmpty();
  expect(c.find('Modal')).toBeEmpty();
  expect(c.find('Nav')).toBeEmpty();
});


test('Renders login when access token is invalid', () => {
  utility.isLocalhost = () => true;
  const c = shallow(<App loaded={ true } invalidToken={ true } />);
  expect(c.find('LoginPrompt')).toBePresent();
});


test('Renders Nav and Modals when on localhost', () => {
  utility.isLocalhost = () => true;
  const c = shallow(<App loaded={ true } />);
  expect(c.find('Modal')).toBePresent();
  expect(c.find('Connect(Nav)')).toBePresent();
});


