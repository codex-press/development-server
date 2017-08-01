import React from 'react'
import { shallow } from 'enzyme'
import { fromJS } from 'immutable'

import { Info } from './Info'

var resolvedAssets = fromJS([
  [
    "/codex/home",
    [
      {
        path: "/codex/home.js",
        stage: "development",
        type: "js",
        source: "/Users/omar/code/codex_press/codex/home.js",
        filename: "codex/home.js"
      },
      {
        path: "/codex/home.css",
        stage: "development",
        type: "css",
        source: "/Users/omar/code/codex_press/codex/home.less",
        filename: "codex/home.less"
      }
    ]
  ]
])


var article = fromJS({
  compressed_style: "",
  canonical_url: "https://codex.press/meh",
  asset_origin: "http://usercontent.codex.press",
  updated_at: "2017-08-01T00:16:16.524Z",
  title: "Codex Press | Multimedia Storytelling",
  created_at: "2016-11-09T22:40:36.334Z",
  slug: "",
  content_origin: "http://usercontent.codex.dev",
  account_id: "5d7afb43-4357-48f9-b543-d2323b115316",
  published: true,
  url: "/meh",
  classed_content : {
    byline:"Katerina Patin",
  },
  metadata: {
    description: "Codex Press, making the Web read better.",
    publication_date: "2016-01-05T05:00:00.000Z"
  },
})


test('renders Info modal', () => {
  const c = shallow(
    <Info
      visible={ true }
      resolvedAssets={ resolvedAssets }
      article={ article }
    />
  )

  expect(c).toMatchSnapshot()
});


