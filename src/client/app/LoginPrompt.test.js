import React from 'react'
import { shallow } from 'enzyme'
import { fromJS } from 'immutable'

import LoginPrompt from './LoginPrompt'



test('renders LoginPrompt', () => {
  const c = shallow(<LoginPrompt />)
  expect(c).toMatchSnapshot()
});



test('shows cancel button when provided a cancel fn as prop', () => {
  const c = shallow(<LoginPrompt cancel={ () => { } } />)
  expect(c).toMatchSnapshot()
});



test('can submit to requestToken', () => {
  const requestToken = jest.fn()
  const c = shallow(<LoginPrompt requestToken={ requestToken } />)
  const values = [ 'test@example.com', 'secret' ]
  c.find('form').simulate('submit', {
    preventDefault: () => {},
    target: { querySelector: () => ({ value: values.shift() }) },
  });
  expect(requestToken.mock.calls).toHaveLength(1)
  expect(requestToken.mock.calls[0]).toEqual([ 'test@example.com', 'secret' ])
});



test('shows loading indicator while token is pending', () => {
  const c = shallow(<LoginPrompt status="pending" />)
  expect(c.find('button')).toMatchSelector('.loading');
});



