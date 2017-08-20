import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import nock from 'nock'
import { fromJS } from 'immutable'
import * as actions from '../actions'

const mockStore = configureMockStore([thunk])


test('apiError clears token with 401 status', () => {
  expect.assertions(2)

  const error = { fetchError: true, status: 400, message: 'fetch error' }

  const expectedActions = [
    {
      type: actions.API_ERROR,
      status: 400,
      message: 'fetch error',
    },
  ]

  const store = mockStore()

  expect(() => {
    store.dispatch(actions.apiError(error))
  }).toThrow()
      
  expect(store.getActions()).toEqual(expectedActions)
})



test('apiError clears token with 401 status', () => {
  expect.assertions(1)

  const error = { fetchError: true, status: 401, message: 'fetch error' }

  const expectedActions = [
    {
      type: actions.API_ERROR,
      status: 401,
      message: 'fetch error',
    },
    { type: "CLEAR_TOKEN", },
    { type: "SET_TOKEN_STATUS", value: "invalid", },
    { type: "SAVE_CONFIG" },
  ]

  const store = mockStore(fromJS({ config: { token: 'foo-bar' } }))

  nock('http://0.0.0.0')
  .post('/api/config')
  .reply(200)

  store.dispatch(actions.apiError(error))

  expect(store.getActions()).toEqual(expectedActions)
})

