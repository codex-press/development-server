import React from 'react'
import { shallow } from 'enzyme'
import { fromJS } from 'immutable'

import { BuildOutput } from './BuildOutput'


const commits = fromJS({
  "004b6ed6-4106-42be-a975-89f7cb2ddfa6": {
    permission: true,
    id: "004b6ed6-4106-42be-a975-89f7cb2ddfa6",
    repository_id: 'f2e8b08a-aceb-415a-9ff8-3efe1bc5757f',
    sha: '16ad6335d2facd9a0f3e600cca9c77bf61017cb5',
    branch: 'master',
    build_status: 'pending',
    build_output: null,
    message: 'changing this all around. open_iconic now just SVG\n',
    author_name: 'Tim Farnam',
    author_email: 'twfarnam@gmail.com',
    created_at: "2017-07-01T22:47:58.810Z",
  }
})

test('renders BuildOutput centered', () => {
  const c = shallow(<BuildOutput state="centered" commits={ commits } />)
  expect(c).toMatchSnapshot()
})


test('renders BuildOutput minimal', () => {
  const c = shallow(<BuildOutput state="minimized" commits={ commits } />)
  expect(c).toMatchSnapshot()
})


test('can mimimizes it', () => {
  const setState = jest.fn()
  const c = shallow(
    <BuildOutput
      state="centered"
      commits={ commits }
      setBuildOutputState={ setState }
    />
  )
  c.find('.minimize').simulate('click')
  expect(setState.mock.calls).toEqual([ [ 'minimal' ] ])
})

test('clicking the Dimmer mimimizes it', () => {
  const setState = jest.fn()
  const c = shallow(
    <BuildOutput
      state="centered"
      commits={ commits }
      setBuildOutputState={ setState }
    />
  )
  c.find('Dimmer').simulate('click')
  expect(setState.mock.calls).toEqual([ [ 'minimal' ] ])
})


test('clicking it in minimized form centers it', () => {
  const setState = jest.fn()
  const c = shallow(
    <BuildOutput
      state="minimal"
      commits={ commits }
      setBuildOutputState={ setState }
    />
  )
  c.find('.BuildOutput').simulate('click', { target: {} } )
  expect(setState.mock.calls).toEqual([ [ 'centered' ] ])
})


