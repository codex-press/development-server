import path from 'path'
import config from './config'
import repos, { updateRepositories } from './repository_collection'


test('updates the list when there a Repository is added or removed', () => {
  expect.assertions(2);

  config.repositories['test2'] = {
    name: 'test2',
    path: path.join(__dirname, '../../test/fixtures/repository-script'),
  }

  updateRepositories()

  expect(repos.map(r => r.name)).toEqual(['test', 'test2'])

  delete config.repositories['test2']

  updateRepositories()

  expect(repos.map(r => r.name)).toEqual(['test'])
});


test('updates the list when there a Repository is changed', () => {
  expect.assertions(2)

  updateRepositories()

  let expected = path.join(__dirname, '../../test/fixtures/repository')

  expect(repos[0].dir).toEqual(expected)

  let changed = path.join(__dirname, '../../test/fixtures/repository-ignore');
  config.repositories.test.path = changed

  updateRepositories()

  expect(repos[0].dir).toEqual(changed)
});



