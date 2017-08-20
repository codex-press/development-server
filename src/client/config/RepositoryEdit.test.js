import React from 'react';
import { shallow } from 'enzyme';
import nock from 'nock';

import RepositoryEdit from './RepositoryEdit';



test('Renders a RepositoryEdit form', () => {
  expect(shallow(<RepositoryEdit name="foo" path="/bar" />)).toMatchSnapshot();
});



test('Shows an invalid name', () => {
  const c = shallow(<RepositoryEdit />);
  c.find('input[name="name"]').simulate('change', { target: { value: 'm' } });
  expect(c.find('IconInvalid')).toBePresent();
});



test('Shows a name that\'s used as invalid', () => {
  const c = shallow(<RepositoryEdit usedNames={ [ 'foo' ] } />);
  c.find('input[name="name"]').simulate('change', { target: { value: 'foo' } });
  expect(c.find('IconInvalid')).toBePresent();
});



test('Shows an invalid path', done => {
  expect.assertions(1);

  jest.useFakeTimers()

  const value = "/some/path"
  const c = shallow(<RepositoryEdit name="foo" />);

  nock('http://0.0.0.0')
  .post('/api/path')
  .reply(200, 'false')

  c.find('input[name="path"]').simulate('change', { target: { value } });

  jest.runAllTimers()
  jest.useRealTimers()

  setTimeout(() => {
    expect(c.find('IconInvalid')).toBePresent()
    done()
  }, 10)

})



test('Submits changes', () => {
  const submit = jest.fn()
  const c = shallow(
    <RepositoryEdit 
      name="foo"
      path="/bar"
      submit={ submit } 
    />
  );
  c.find('form').simulate('submit', { preventDefault: () => {} });
  expect(submit.mock.calls).toHaveLength(1)
  expect(submit.mock.calls[0]).toEqual([ 'foo', '/bar' ])
});



test('Does not submit invalid props', () => {
  const submit = jest.fn()
  const c = shallow(
    <RepositoryEdit 
      name="s"
      path="/bar"
      submit={ submit } 
    />
  );
  c.find('form').simulate('submit', { preventDefault: () => {} });
  expect(submit.mock.calls).toHaveLength(0)
});


