import nock from 'nock';
import request from 'supertest';
import cheerio from 'cheerio';

import app from './app';
import * as env from './env';
import config from './config';
import repos from './repository_collection.js';


beforeAll(() => repos[0].ready)


test('can load a page', async () => {
  expect.assertions(8)

  const res = await request(app).get('/anything')

  const $ = cheerio.load(res.text);

  expect(res.status).toBe(200);
  expect($('meta[name="codex:client-render"]').prop('content')).toBeDefined();
  expect($('meta[name="codex:content_origin"]').prop('content')).toBeDefined();
  expect($('meta[name="codex:codex_origin"]').prop('content')).toBeDefined();
  expect($('meta[name="codex:asset_origin"]').prop('content')).toBeDefined();
  expect($('meta[name="codex:env"]').prop('content')).toBeDefined();
  expect($('script[src="/app/loader.js"]')).toHaveLength(1);
  expect($('script[src="/dev-server.js"]')).toHaveLength(1);
});



test('can disable / enable Content-Security-Policy', async () => {
  expect.assertions(2)

  let res = await request(app).get('/anything')
  expect(res.get('content-security-policy')).toBeDefined();

  config.disable_csp = true;

  res = await request(app).get('/anything')
  expect(res.get('content-security-policy')).toBeUndefined();

  config.disable_csp = false;
});



test('proxies assets from production', async () => {
  expect.assertions(3)

  const path = '/app/templates/facebook.html'
  const template = '<div>some htmls</div>'

  nock(env.contentOrigin)
  .get(path)
  .reply(200, template, { 'content-type': 'text/html' })

  const res = await request(app).get(path)

  expect(res.status).toBe(200)
  expect(res.get('content-type')).toBe('text/html')
  expect(res.text).toBe(template)
});



test('returns HTML templates from repositories', async () => {
  expect.assertions(3)

  const path = '/test/template.html'

  const res = await request(app).get(path)

  expect(res.status).toBe(200)
  expect(res.get('content-type')).toBe('text/html; charset=UTF-8')
  expect(res.text).toBe('<div>foo bar</div>\n')
});



test('fonts', async () => {
  expect.assertions(3)

  const path = '/test/font.woff'

  const res = await request(app).get(path)

  expect(res.status).toBe(200)
  expect(res.get('content-type')).toBe('application/font-woff')
  expect(res.text).toBe('woof\n')
});



test('SVG images', async () => {
  expect.assertions(3)

  const path = '/test/logo.svg'

  const res = await request(app).get(path)

  expect(res.status).toBe(200)
  expect(res.get('content-type')).toBe('image/svg+xml')
  expect(res.body.toString()).toBe('<svg><path /></svg>\n')
});



test('CSS', async () => {
  expect.assertions(3)

  const path = '/test/styles.css'

  const res = await request(app).get(path)

  expect(res.status).toBe(200)
  expect(res.get('content-type')).toBe('text/css; charset=utf-8')
  expect(res.text).toBe('\nbody {\n  margin: 1rem;\n}\n\n');
});



test('JavaScript', async () => {
  expect.assertions(3)

  const path = '/test/script.js'

  const res = await request(app).get(path)

  expect(res.status).toBe(200)
  expect(res.get('content-type')).toBe('application/javascript; charset=utf-8')
  expect(res.text).toBe(`System.register("/test/script.js", [], function (_export, _context) {
  "use strict";

  var b;
  function doStuffs() {
    return 5;
  }

  _export("doStuffs", doStuffs);

  return {
    setters: [],
    execute: function () {
      _export("b", b = 10);

      _export("b", b);
    }
  };
});
\/\/# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9vbWFyL2NvZGUvY29kZXhfcHJlc3MvZGV2ZWxvcG1lbnQtc2VydmVyL3Rlc3QvZml4dHVyZXMvcmVwb3NpdG9yeS9zY3JpcHQuanMiXSwibmFtZXMiOlsiZG9TdHVmZnMiLCJiIl0sIm1hcHBpbmdzIjoiOzs7O0FBR08sV0FBU0EsUUFBVCxHQUFvQjtBQUN6QixXQUFPLENBQVA7QUFDRDs7c0JBRmVBLFE7Ozs7O21CQUZMQyxDLEdBQUksRSIsImZpbGUiOiJ1bmtub3duIiwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgdmFyIGIgPSAxMDtcblxuZXhwb3J0IGZ1bmN0aW9uIGRvU3R1ZmZzKCkge1xuICByZXR1cm4gNTtcbn1cblxuXG4iXX0=\
`);
 
});



test('JavaScript for modules', async () => {
  expect.assertions(3)

  const path = '/test/script.js'

  const res = await request(app)
    .get(path)
    .set('referer', 'http://localhost:8000/?modules')

  expect(res.status).toBe(200)
  expect(res.get('content-type')).toBe('application/javascript; charset=utf-8')
  expect(res.text).toBe('\nexport var b = 10;\n\nexport function doStuffs() {\n  return 5;\n}\n\n\n');
});



test('JavaScript source as text', async () => {
  expect.assertions(3)

  const path = '/test/script.js'

  const res = await request(app)
    .get(path)
    .set('accept', 'text/plain')

  expect(res.status).toBe(200)
  expect(res.get('content-type')).toBe('text/plain; charset=utf-8')
  expect(res.text).toBe('\nexport var b = 10;\n\nexport function doStuffs() {\n  return 5;\n}\n\n\n');
});



