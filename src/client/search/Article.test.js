import React from 'react';
import { shallow } from 'enzyme';

import Article from './Article';

const article = {
  id: "18eb08bf-f921-4aa7-9624-5f03a4f0e3ca",
  parent_id: "572773cc-00cb-4173-a0df-23c43f018e2f",
  title: "Issac Asimov Say Some Sheez",
  slug: "asimov-steez",
  url: "/ricd/asimov-steez",
  published: false,
  metadata: {
    description: "Old white dude talkin bout da moon. Word.",
    publication_date: ""
  },
  classed_content: {
  },
  updated_at: "2017-05-28T17:49:51.000Z",
  created_at: "2016-12-12T22:44:16.276Z",
  deleted_at: null,
  type: "Article",
  cover: {
    media: {
      srcset: [
        {
          url: "/images/8c253631-6611-4158-b236-edd98495fc64/i200.jpg",
          width: 200,
          height: 158
        },
        {
          url: "/images/8c253631-6611-4158-b236-edd98495fc64/i500.jpg",
          width: 500,
          height: 394
        },
        {
          url: "/images/8c253631-6611-4158-b236-edd98495fc64/i1000.jpg",
          width: 1000,
          height: 789
        },
      ],
    }
  }
}



test('Renders an article', () => {
  expect(shallow(
    <Article
      navigate={ () => window.location.href = a.url }
      select={ () => this.select(a) }
      { ...article }
      selected={ false }
    />
  )).toMatchSnapshot();
});



test('Renders a selected article', () => {
  expect(shallow(
    <Article { ...article } selected={ true } />
  )).toHaveClassName('selected');
});



test('Clicking an article triggers navigate', () => {
  const navigate = jest.fn();
  const c = shallow(<Article { ...article } navigate={ navigate } />)
  c.simulate('click');
  expect(navigate.mock.calls.length).toBe(1);
})



test('Wheel on an article selects it', () => {
  const select = jest.fn();
  const c = shallow(<Article { ...article } select={ select } />)
  c.simulate('wheel');
  expect(select.mock.calls.length).toBe(1);
});



test('Removes path prefix from url', () => {
  const c = shallow(<Article { ...article } pathPrefix="/ricd" />)
  expect(c.find('.url').text()).toBe('/asimov-steez');
});


