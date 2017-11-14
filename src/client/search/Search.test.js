import React from 'react';
import { shallow } from 'enzyme';
import nock from 'nock';
import qs from 'querystring';
import { Map, fromJS } from 'immutable';

import * as env from '../env';

import { Search } from './Search';



test('Renders a Search form', () => {
  expect(shallow(<Search visible={ true } />)).toMatchSnapshot();
});


const articles = [
  {
    "id": "9079fe60-4a1a-492d-945d-18b0fcad6c76",
    "title": "Russia's Dangerous New Vigilantism",
    "slug": "subcontracting-political-violence",
    "url": "/coda/lgbt-crisis/subcontracting-political-violence",
    "published": true,
    "metadata": {
      "publicationDate": "2016-01-18T05:00:00.000Z"
    },
    "classedContent": {
      "byline": "Ilan Greenberg",
    },
    "cover": {
      "id": "24d84dbe-444e-4da2-9b38-751bf9d6fbd0",
      "type": "Image",
      "media": {
        "srcset": [
          {
            "url": "/images/19c915ab-7290-4c73-9629-a4c4c0854c6a/i200.jpg",
            "width": 200,
            "height": 133
          },
          {
            "url": "/images/19c915ab-7290-4c73-9629-a4c4c0854c6a/i500.jpg",
            "width": 500,
            "height": 333
          },
        ],
      }
    }
  }
]


test('Performs a search', done => {

  expect.assertions(1);

  jest.useFakeTimers()

  const c = shallow(<Search visible={ true } />);

  const value = 'greenberg'

  const query = { limit: 20, q: value }

  nock(env.apiOrigin)
  .get('/articles?' + qs.stringify(query))
  .reply(200, articles)

  c.find('input').simulate('change', { target: { value } });

  jest.runAllTimers()
  jest.useRealTimers()

  setTimeout(() => {
    expect(c.debug()).toMatchSnapshot()
    done()
  }, 10)

})



test('Uses domain to query results and display them', done => {
  expect.assertions(1);

  jest.useFakeTimers()

  const c = shallow(
    <Search 
      visible={ true } 
      config={ Map({ domain: 'foo.bar' }) }
      domains={ fromJS([{ name: 'foo.bar', path: '/foo' }]) }
    />
  );

  const value = 'greenberg'

  const query = { limit: 20, q: value, path: '/foo' }

  nock(env.apiOrigin)
  .get('/articles?' + qs.stringify(query))
  .reply(200, articles)

  c.find('input').simulate('change', { target: { value } });

  jest.runAllTimers()
  jest.useRealTimers()

  setTimeout(() => {
    expect(c.debug()).toMatchSnapshot()
    done()
  }, 10)

})


