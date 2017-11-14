import React from 'react'
import { shallow } from 'enzyme'

import Commit from './Commit'

const commit = {
  permission: true,
  repositoryName: 'lib',
  id: "004b6ed6-4106-42be-a975-89f7cb2ddfa6",
  repositoryID: 'f2e8b08a-aceb-415a-9ff8-3efe1bc5757f',
  sha: '16ad6335d2facd9a0f3e600cca9c77bf61017cb5',
  branch: 'master',
  buildStatus: 'pending',
  buildOutput: null,
  message: 'changing this all around. open_iconic now just SVG\n',
  authorName: 'Tim Farnam',
  buildProgress: '0.55',
  buildOutput: [ 'first line\n', 'second line\n' ],
  authorEmail: 'twfarnam@gmail.com',
  createdAt: "2017-07-01T22:47:58.810Z",
}


test('renders Commit', () => {
  const c = shallow(<Commit { ...commit } />)
  expect(c).toMatchSnapshot()
})


