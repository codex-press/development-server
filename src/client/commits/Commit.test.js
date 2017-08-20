import React from 'react'
import { shallow } from 'enzyme'

import Commit from './Commit'

const commit = {
  permission: true,
  repository_name: 'lib',
  id: "004b6ed6-4106-42be-a975-89f7cb2ddfa6",
  repository_id: 'f2e8b08a-aceb-415a-9ff8-3efe1bc5757f',
  sha: '16ad6335d2facd9a0f3e600cca9c77bf61017cb5',
  branch: 'master',
  build_status: 'pending',
  build_output: null,
  message: 'changing this all around. open_iconic now just SVG\n',
  author_name: 'Tim Farnam',
  build_progress: '0.55',
  build_output: [ 'first line\n', 'second line\n' ],
  author_email: 'twfarnam@gmail.com',
  created_at: "2017-07-01T22:47:58.810Z",
}


test('renders Commit', () => {
  const c = shallow(<Commit { ...commit } />)
  expect(c).toMatchSnapshot()
})


