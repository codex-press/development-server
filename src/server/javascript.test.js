import { makeRepository } from '../../test/utility';


test('can return JavaScript', async () => {
  expect.assertions(1);

  const repo = await makeRepository('repository');

  const code = await repo.code('/test/script.js')

  const expected = 'System.register("/test/script.js", [], function (_export, _context) {\n  "use strict";\n\n  var b;\n  function doStuffs() {\n    return 5;\n  }\n\n  _export("doStuffs", doStuffs);\n\n  return {\n    setters: [],\n    execute: function () {\n      _export("b", b = 10);\n\n      _export("b", b);\n    }\n  };\n});\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9vbWFyL2NvZGUvY29kZXhfcHJlc3MvZGV2ZWxvcG1lbnQtc2VydmVyL3Rlc3QvZml4dHVyZXMvcmVwb3NpdG9yeS9zY3JpcHQuanMiXSwibmFtZXMiOlsiZG9TdHVmZnMiLCJiIl0sIm1hcHBpbmdzIjoiOzs7O0FBR08sV0FBU0EsUUFBVCxHQUFvQjtBQUN6QixXQUFPLENBQVA7QUFDRDs7c0JBRmVBLFE7Ozs7O21CQUZMQyxDLEdBQUksRSIsImZpbGUiOiJ1bmtub3duIiwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgdmFyIGIgPSAxMDtcblxuZXhwb3J0IGZ1bmN0aW9uIGRvU3R1ZmZzKCkge1xuICByZXR1cm4gNTtcbn1cblxuXG4iXX0='

  expect(code).toBe(expected);
});



test('can return JavaScript for modules', async () => {
  expect.assertions(1);

  const repo = await makeRepository('repository')

  const code = await repo.code('/test/script.js', { useModules: true })

  const expected = '\nexport var b = 10;\n\nexport function doStuffs() {\n  return 5;\n}\n\n\n';

  expect(code).toBe(expected);
});



test('returns JavaScript with "script" option', async () => {
  expect.assertions(1);

  const repo = await makeRepository('repository-script')

  const code = await repo.code('/test/script.js')

  const expected = 'console.log(`I\'m not transpiled`);\n'

  expect(code).toBe(expected);
});



test('emits error for bad JavaScript', async () => {
  expect.assertions(2);

  const repo = await makeRepository('repository')

  const msg = new Promise(resolve => repo.on('message', m => resolve(m)))

  try {
    const code = await repo.code('/test/error.js')
  }
  catch (error) {

    const expected = {
      type: "JavaScript",
      filename: "error.js",
      message: "unknown: Unexpected token (2:9)",
      line: 2,
      column: 9,
      extract: "  1 | \n> 2 | function () {\n    |          ^\n  3 | \n  4 | \n  5 | "
    }

    expect(error).toEqual(expected);

    const expectedMessage = {
      event: 'error',
      repositoryName: 'test',
      filename: 'error.js',
      paths: [ '/test/error.js' ],
      error: expected,
    }

    expect(await msg).toEqual(expectedMessage);
  }

});



