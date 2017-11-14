import React from 'react'
import { shallow } from 'enzyme'
import { fromJS } from 'immutable'

import AccountDetails from './AccountDetails'


test('renders loading message', () => {
  const c = shallow(<AccountDetails />)
  expect(c).toMatchSnapshot()
});


const account = fromJS({
  rootDirectoryURL: "/twf/",
  attrs: { },
  rootDirectoryID: "1ebb88aa-735e-47c5-8fff-54e210bf3fdc",
  hasDomains: true,
  name: "Tim",
  hasRepositories: true,
  stripeSubscription: null,
  hasFilesystem: true,
  hasHTML: true,
  stripeCustomer: null,
  spaceUsed: 5827548961,
  stripeInvoices: [],
  hasIndexes: true,
  id: "86c23a97-af87-4bb7-8efd-4187a0ac8a33",
  email: "twfarnam@gmail.com",
  stripePlanID: "free"
});


test('renders AccountDetails', () => {
  const c = shallow(<AccountDetails account={ account } />)
  expect(c).toMatchSnapshot()
});


