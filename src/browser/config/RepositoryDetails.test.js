import React from 'react'
import { shallow } from 'enzyme'

import RepositoryDetails from './RepositoryDetails'

const repository = {
  name: "parent",
  path: "/Users/omar/code/codex_press/parent",
  assets: [
    "/parent/index.css",
    "/parent/index.js",
  ],
  files: [
    {
      filename: "index.js",
      path: "/parent/index.js"
    },
    {
      filename: "index.less",
      path: "/parent/index.css",
      deps: [
        "css/editor_nag.less",
        "css/scroll_alert.less",
        "css/article.less",
        "css/knot_loading_graphic.less",
      ]
    },
    {
      filename: "package.json"
    },
    {
      filename: "test/dom/attributes.js"
    },
    {
      filename: "test/dom/classes.js"
    },
  ]
}


test('renders RepositoryDetails', () => {
  const c = shallow(<RepositoryDetails { ...repository } />)
  expect(c).toMatchSnapshot()
});


