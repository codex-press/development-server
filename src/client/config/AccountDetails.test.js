import React from 'react'
import { shallow } from 'enzyme'
import { fromJS } from 'immutable'

import AccountDetails from './AccountDetails'


test('renders loading message', () => {
  const c = shallow(<AccountDetails />)
  expect(c).toMatchSnapshot()
});


const account = fromJS({
  root_directory_url: "/twf/",
  attrs: { },
  root_directory_id: "1ebb88aa-735e-47c5-8fff-54e210bf3fdc",
  has_domains: true,
  name: "Tim",
  has_deleted_files: false,
  has_repositories: true,
  stripe_subscription: null,
  has_filesystem: true,
  has_html: true,
  stripe_customer: null,
  space_used: 5827548961,
  stripe_invoices: [],
  has_indexes: true,
  id: "86c23a97-af87-4bb7-8efd-4187a0ac8a33",
  email: "twfarnam@gmail.com",
  stripe_plan_id: "free"
});


test('renders AccountDetails', () => {
  const c = shallow(<AccountDetails account={ account } />)
  expect(c).toMatchSnapshot()
});


