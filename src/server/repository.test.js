import path from 'path';
import fs from 'fs';
import { sync as touch } from 'touch';

import Repository from './repository.js';


const makeRepository = async (name, opts) => {
  const repo = new Repository({
    name,
    directory: path.resolve('./test/fixtures/' + name),
    watch: false,
    ...opts
  });
  await repo.ready;
  return repo;
}



test('returns a broken state when the directory doesnt exist', async () => {
  expect.assertions(3);
  let repo = await makeRepository('NOT EXIST');
  expect(repo.toJSON().broken).toBe(true);
  expect(repo.toJSON().files).toBeUndefined();
  expect(repo.toJSON().assets).toBeUndefined();
});



test('reads package.json', async () => {
  expect.assertions(1);
  const repo = await makeRepository('repository-script');
  expect(repo.config).toEqual({ ignore: [], script: [ "script.js" ] });
});



test('toJSON() returns name, path, assets and files', async () => {
  expect.assertions(1);

  const repo = await makeRepository('repository');
  const expected = {
    name: "repository",
    path: path.join(__dirname, "../../test/fixtures/repository"),
    assets: [
      "/repository/base.css",
      "/repository/font.ttf",
      "/repository/font.woff",
      "/repository/font.woff2",
      "/repository/module.js",
      "/repository/script.js",
      "/repository/styles.css",
    ],
    files: [
      { filename: "bad-extension.txt" },
      { filename: "base.less", path: "/repository/base.css" },
      { filename: "font.ttf", path: "/repository/font.ttf" },
      { filename: "font.woff", path: "/repository/font.woff" },
      { filename: "font.woff2", path: "/repository/font.woff2" },
      { filename: "module.js", path: "/repository/module.js" },
      { filename: "script.js", path: "/repository/script.js" },
      { filename: "styles.css", path: "/repository/styles.css" },
    ]
  }
  expect(repo.toJSON()).toEqual(expected);
});



test('ignores node_modules', async () => {
  expect.assertions(1);
  const repo = await makeRepository('repository-node-modules');

  const expected = [{
    filename: "script.js",
    path: "/repository-node-modules/script.js",
  }];

  expect(repo.toJSON().files).toEqual(expected);
});



test('"ignore" section of package.json works', async () => {
  expect.assertions(1);
  const repo = await makeRepository('repository-ignore');

  const expected = [
    { filename: "dir/ignored.js" },
    { filename: "dir2/not-ignored.js", path: "/repository-ignore/dir2/not-ignored.js" },
    { filename: "dir2/subdir/ignored.js" },
    { filename: "ignored.js" },
    { filename: "not-ignored.js", path: "/repository-ignore/not-ignored.js" },
    { filename: "package.json" },
  ];

  expect(repo.toJSON().files).toEqual(expected);
});



test.skip('changing the "ignore" section of package.json updates file list', async () => {

});



test('"only" section of package.json works', async () => {
  expect.assertions(1);
  const repo = await makeRepository('repository-only');
  const expected = [
    { filename: 'also-ignored.js' },
    { filename: 'ignored.js' },
    { filename: 'only.js', path: '/repository-only/only.js' },
    { filename: 'package.json' },
  ];
  expect(repo.toJSON().files).toEqual(expected);
});



test('ignores dotfiles', async () => {
  expect.assertions(1);
  const repo = await makeRepository('repository-dot-file');
  expect(repo.toJSON().files).toEqual([]);
});



test('change to file is emitted', async done => {
  expect.assertions(1);
  const repo = await makeRepository('repository', { watch: true });
  repo.on('message', e => {
    expect(e.change).toEqual(['script.js']);
    repo.close();
    done();
  });
  touch(path.join(repo.dir, 'script.js'));
});



test('change to ignored file is not emitted', async done => {
  expect.assertions(1);
  const repo = await makeRepository('repository-ignore', { watch: true });
  repo.on('message', e => {
    expect(e.change).toEqual(['not-ignored.js']);
    repo.close();
    done();
  });
  touch(path.join(repo.dir, 'ignored.js'));
  touch(path.join(repo.dir, 'not-ignored.js'));
});



test('emits change for package.json', async done => {
  expect.assertions(1);
  const repo = await makeRepository('repository-only', { watch: true });
  repo.on('message', e => {
    expect(e.change).toEqual(['package.json']);
    repo.close();
    done();
  });
  touch(path.join(repo.dir, 'package.json'));
});



test('emits add event', async done => {
  expect.assertions(1);
  const newFilename = (Math.random() + '').slice(2) + '.js';
  const repo = await makeRepository('repository-add', { watch: true });
  repo.on('message', e => {
    expect(e.add).toEqual([ newFilename ]);
    repo.close();
    done();
    fs.unlinkSync(path.join(repo.dir, newFilename));
  });
  touch(path.join(repo.dir, newFilename));
});



test('emits remove event', async done => {
  expect.assertions(1);
  const newFilename = (Math.random() + '').slice(2) + '.js';
  const repo = await makeRepository('repository-remove', { watch: true });
  repo.on('message', e => {
    if (!('remove' in e)) return;
    expect(e.remove).toEqual([ newFilename ]);
    repo.close();
    done();
  });
  touch(path.join(repo.dir, newFilename));
  setTimeout(() => fs.unlinkSync(path.join(repo.dir, newFilename)), 100);
});



test.skip('emits messages for a file when its dependencies change', async () => {

});



test('favors asset.css to asset.less', async () => {
  expect.assertions(1);
  const repo = await makeRepository('repository-dupes');
  const expected = [
    { filename: 'more.css' },
    { filename: 'more.dev.css', path: '/repository-dupes/more.css' },
    { filename: 'styles.css', path: '/repository-dupes/styles.css' },
    { filename: 'styles.less' },
  ];
  expect(repo.toJSON().files).toEqual(expected);
});



test.skip('can build CSS', async () => {

});



test.skip('can build LESS', async () => {

});



test.skip('does not emit a change for a file thats ignored', async () => {

});



test.skip('can return JavaScript', async () => {

});



test.skip('can return JavaScript for modules', async () => {

});



test.skip('returns JavaScript with "script" option', async () => {

});



test.skip('emits error for bad JavaScript', async () => {

});



