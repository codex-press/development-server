import React from 'react'
import { shallow } from 'enzyme'
import { Map, fromJS } from 'immutable'

import { Config } from './Config'

var repositories = fromJS({
  app: {
    name: 'app',
    path: '/app',
  }
});


test('renders Config', () => {
  const c = shallow(
    <Config
      visible={ true }
      config={ Map({}) }
      repositories={ repositories }
      domains={ Map({}) }
      account={ Map({}) }
      users={ Map({}) }
    />
  )

  expect(c).toMatchSnapshot()
});


