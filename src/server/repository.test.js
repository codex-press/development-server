import path from 'path';
import fs from 'fs';
import { sync as touch } from 'touch';

import { makeRepository } from '../../test/utility';



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
    name: 'test',
    path: path.join(__dirname, '../../test/fixtures/repository'),
    assets: [
      '/test/base.css',
      '/test/error.css',
      '/test/error.js',
      '/test/font.ttf',
      '/test/font.woff',
      '/test/font.woff2',
      '/test/less-error.css',
      '/test/logo.svg',
      '/test/script.js',
      '/test/styles.css',
      '/test/template.html',
    ],
    files: [
      { filename: 'bad-extension.txt' },
      { filename: 'base.less', path: '/test/base.css' },
      { filename: 'error.css', path: '/test/error.css' },
      { filename: 'error.js', path: '/test/error.js' },
      { filename: 'font.ttf', path: '/test/font.ttf' },
      { filename: 'font.woff', path: '/test/font.woff' },
      { filename: 'font.woff2', path: '/test/font.woff2' },
      { filename: 'less-error.less', path: '/test/less-error.css' },
      { filename: 'logo.svg', path: '/test/logo.svg' },
      { filename: 'script.js', path: '/test/script.js' },
      { filename: 'styles.css', path: '/test/styles.css' },
      { filename: 'template.html', path: '/test/template.html' },
    ]
  }
  expect(repo.toJSON()).toEqual(expected);
});



test('ignores node_modules', async () => {
  expect.assertions(1);
  const repo = await makeRepository('repository-node-modules');

  const expected = [{
    filename: 'script.js',
    path: '/test/script.js',
  }];

  expect(repo.toJSON().files).toEqual(expected);
});



test('"ignore" section of package.json works', async () => {
  expect.assertions(1);
  const repo = await makeRepository('repository-ignore');

  const expected = [
    { filename: 'dir/ignored.js' },
    { filename: 'dir2/not-ignored.js', path: '/test/dir2/not-ignored.js' },
    { filename: 'dir2/subdir/ignored.js' },
    { filename: 'ignored.js' },
    { filename: 'not-ignored.js', path: '/test/not-ignored.js' },
    { filename: 'package.json' },
  ];

  expect(repo.toJSON().files).toEqual(expected);
});



test('changing "ignore" option updates file list', async () => {
  expect.assertions(2)

  const repo = await makeRepository(
    'repository-change-ignore',
    { watch: true }
  )

  let msg = new Promise(resolve => repo.on('message', m => resolve(m)))

  const initial = { codex : { ignore : [ "ignored.js", ] } }

  fs.writeFileSync(
    path.join(repo.dir, 'package.json'),
    JSON.stringify(initial, null, 2)
  )

  await msg

  const expectedInitial = [
    { filename: "going-to-be.js", path: "/test/going-to-be.js" },
    { filename: "ignored.js" },
    { filename: "package.json" },
  ]

  expect(repo.toJSON().files).toEqual(expectedInitial)

  msg = new Promise(resolve => repo.on('message', m => resolve(m)))

  const changed = { codex : { ignore : [ "going-to-be.js", ] } }

  fs.writeFileSync(
    path.join(repo.dir, 'package.json'),
    JSON.stringify(changed, null, 2)
  )

  await msg

  const expected = [
    { filename: "going-to-be.js" },
    { filename: "ignored.js", path: "/test/ignored.js" },
    { filename: "package.json" },
  ]

  expect(repo.toJSON().files).toEqual(expected)
})



test('"only" section of package.json works', async () => {
  expect.assertions(1);
  const repo = await makeRepository('repository-only');
  const expected = [
    { filename: 'also-ignored.js' },
    { filename: 'ignored.js' },
    { filename: 'only.js', path: '/test/only.js' },
    { filename: 'package.json' },
  ];
  expect(repo.toJSON().files).toEqual(expected);
});



test('ignores dotfiles', async () => {
  expect.assertions(1);
  const repo = await makeRepository('repository-dot-file');
  expect(repo.toJSON().files).toEqual([]);
});



test('change to file is emitted', async () => {
  expect.assertions(2);
  const repo = await makeRepository('repository', { watch: true });
  
  let message = new Promise(resolve => repo.on('message', e => resolve(e)));

  setTimeout(() => touch(path.join(repo.dir, 'script.js')));

  message = await message
  expect(message.event).toBe('change')
  expect(message.filename).toBe('script.js')
  repo.close()
});



test('change to ignored file is not emitted', async done => {
  expect.assertions(1);
  const repo = await makeRepository('repository-ignore', { watch: true });
  repo.on('message', e => {
    expect(e.filename).toBe('not-ignored.js');
    repo.close();
    done();
  });
  touch(path.join(repo.dir, 'ignored.js'));
  touch(path.join(repo.dir, 'not-ignored.js'));
});



test('emits change for package.json', async () => {
  expect.assertions(2);
  const repo = await makeRepository('repository-only', { watch: true });

  let message = new Promise(resolve => repo.on('message', e => resolve(e)));

  touch(path.join(repo.dir, 'package.json'));

  message = await message

  expect(message.event).toBe('change');
  expect(message.filename).toBe('package.json');
  repo.close();
});



test('emits add event', async () => {
  expect.assertions(2);
  const newFilename = (Math.random() + '').slice(2) + '.js';
  const repo = await makeRepository('repository-add', { watch: true });

  let message = new Promise(resolve => repo.on('message', e => resolve(e)));

  touch(path.join(repo.dir, newFilename));

  message = await message

  expect(message.event).toBe('add');
  expect(message.filename).toBe(newFilename);
  repo.close();

  fs.unlinkSync(path.join(repo.dir, newFilename));
});



test('emits remove event', async done => {
  expect.assertions(2);
  const newFilename = (Math.random() + '').slice(2) + '.js';
  const repo = await makeRepository('repository-remove', { watch: true });
  repo.on('message', e => {
    if (e.event !== 'remove') return;
    expect(e.event).toBe('remove');
    expect(e.filename).toBe(newFilename);
    repo.close();
    done();
  });
  touch(path.join(repo.dir, newFilename));
  setTimeout(() => fs.unlinkSync(path.join(repo.dir, newFilename)), 100);
});



test('favors asset.css to asset.less', async () => {
  expect.assertions(1);
  const repo = await makeRepository('repository-dupes');
  const expected = [
    { filename: 'more.css' },
    { filename: 'more.dev.css', path: '/test/more.css' },
    { filename: 'styles.css', path: '/test/styles.css' },
    { filename: 'styles.less' },
  ];
  expect(repo.toJSON().files).toEqual(expected);
})



test('change event lists paths for other affected assets', async () => {
  expect.assertions(1);
  const repo = await makeRepository('repository-change-deps', { watch: true });

  repo.files = [
    { filename: 'touched.less', path: '/test/touched.css' },
    { filename: 'p.less', path: '/test/p.css', deps: [ 'touched.less' ] },
    { filename: 'q.less', path: '/test/q.css', deps: [ 'touched.less' ] },
  ]

  let message = new Promise(resolve => repo.on('message', e => resolve(e)));

  setTimeout(() => touch(path.join(repo.dir, 'touched.less')));

  message = await message

  expect(message.paths).toEqual([
    '/test/p.css',
    '/test/q.css',
    '/test/touched.css',
  ]);

  repo.close()
});




