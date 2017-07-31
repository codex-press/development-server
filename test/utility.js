import path from 'path';

import Repository from '../src/server/repository.js';


export async function makeRepository(repositoryPath, opts) {
  const repo = new Repository({
    name: 'test',
    directory: path.resolve('./test/fixtures/' + repositoryPath),
    watch: false,
    ...opts
  });
  await repo.ready;
  return repo;
}


