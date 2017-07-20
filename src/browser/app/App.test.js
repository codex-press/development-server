import React from 'react';
import { shallow } from 'enzyme';
import { Map } from 'immutable';

import * as utility from '../utility';
import { App } from './App';
import LoginPrompt from './LoginPrompt';


test('Renders nothing when it is loading', () => {
  expect(shallow(<App ui={ Map() } />).debug()).toHaveLength(0);
});


test('Renders only alert container when not on localhost', () => {
  utility.isLocalhost = false;
  let props = {
    ui: Map({ token_status: 'valid' }),
    config: Map({})
  };
  const c = shallow(<App { ...props } />);
  expect(c.find('Connect(AlertContainer)')).toBePresent();
  expect(c.find('LoginPrompt')).toBeEmpty();
  expect(c.find('Modal')).toBeEmpty();
  expect(c.find('Nav')).toBeEmpty();
});


test('Renders login when access token is invalid', () => {
  utility.isLocalhost = true;

  let props = {
    ui: Map({ token_status: 'invalid' }),
    config: Map({})
  };
  const c = shallow(<App { ...props } />);
  expect(c.find('LoginPrompt')).toBePresent();
});


test('Renders Nav and Modals when on localhost', () => {
  utility.isLocalhost = true;

  let props = {
    ui: Map({ token_status: 'valid' }),
    config: Map({})
  };
  const c = shallow(<App { ...props } />);

  expect(c.find('Modal')).toBePresent();
  expect(c.find('Connect(Nav)')).toBePresent();
});


