import React from 'react'
import { shallow } from 'enzyme'

import RepositoryBroken from './RepositoryBroken'

test('renders RepositoryBroken', () => {
  const c = shallow(
    <RepositoryBroken
      name="app"
      path="/app"
      remove={ () => { } }
      edit={ () => { } }
    />
  )

  expect(c).toMatchSnapshot()
});


