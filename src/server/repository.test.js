import path from 'path';

import Repository from './repository.js';

const newRepo = async name => {
  const repo = new Repository({
    name,
    directory: path.resolve('./test/fixtures/' + name),
    persistent: false
  });
  await repo.ready;
  return repo;
}


test('finds files and assets', async () => {
  let repo = await newRepo('repository');
  expect(repo.toJSON().files).toHaveLength(8);
  expect(repo.toJSON().assets).toHaveLength(5);
  repo.close();
});



test('toJSON() returns name, path, assets and files', async () => {
  try {
    const repo = await newRepo('repository');
    const expected = ['name', 'path', 'assets', 'files'];
    expect(Object.keys(repo.toJSON())).toEqual(expected);
    // console.log(repo);
    // console.warn(repo.toJSON());
    repo.close();
  }
  catch (error) {
    console.log(error);
  }
});


test('gets broken state when the directory doesnt exist', async () => {
  // let repo = await newRepo();

  const repo = new Repository({
    name: 'test',
    directory: path.resolve('./test/fixtures/NOT\ EXIST'),
    persistent: false
  });
  await repo.ready;

  expect(repo.toJSON().broken).toBe(true);
  expect(repo.toJSON().files).toBeUndefined();
  expect(repo.toJSON().assets).toBeUndefined();
  repo.close();
});


test.skip('reads package.json', async () => {

});


test.skip('has a setDisabled function that will remove wathcer, compiled code etc', async () => {

});


test.skip('"ignore" section of package.json works', async () => {

  // mimics “ignore” logic from lib/codex/commit.rb
});

test.skip('removes .dev.js files', async () => {

});


test.skip('favors asset.css to asset.less', async () => {

});


test.skip('emits on parent asset for LESS as dependency', async () => {

});

test.skip('"only" section of package.json works', async () => {

});



test.skip('emits change when a file is touched', async () => {

});


test.skip('does not emit a change for a file thats ignored', async () => {

});



test.skip('emits change for package.json', async () => {
})



test.skip('will not serve a file if it has an invalid path with periods or something', async () => {

});


test.skip('emits add event', async () => {

});

test.skip('emits add event', async () => {

});


test.skip('can return JavaScript', async () => {

});


test.skip('can return JavaScript for modules', async () => {

});


test.skip('can build LESS', async () => {

});


test.skip('emits error for bad JavaScript', async () => {

});


