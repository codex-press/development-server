import { makeRepository } from '../../test/utility';


test('can build CSS', async () => {
  expect.assertions(1)

  const repo = await makeRepository('repository')

  const code = await repo.code('/test/styles.css')

  const expected = '\nbody {\n  margin: 1rem;\n}\n\n'

  expect(code).toBe(expected)
})


test('returns error for bad CSS', async () => {
  expect.assertions(2)

  const repo = await makeRepository('repository')

  const msg = new Promise(resolve => repo.on('message', m => resolve(m)))

  try {
    await repo.code('/test/error.css')
  }
  catch (error) {

    const expected =  {
      filename: 'error.css',
      type: 'CSS',
      message: 'Unclosed block',
      line: 2,
      column: 1
    }

    expect(error).toEqual(expected)

    const expectedMessage = {
      event: 'error',
      repositoryName: 'test',
      filename: 'error.css',
      paths: [ '/test/error.css' ],
      error: expected,
    }

    expect(await msg).toEqual(expectedMessage);
  }

})


test('can build LESS, setting dependencies', async () => {
  expect.assertions(2)

  const repo = await makeRepository('repository')

  const code = await repo.code('/test/base.css')

  const expected = '\nbody {\n  margin: 1rem;\n}\n\n\nbody {\n  padding: 5px;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9vbWFyL2NvZGUvY29kZXhfcHJlc3MvZGV2ZWxvcG1lbnQtc2VydmVyL3Rlc3QvZml4dHVyZXMvcmVwb3NpdG9yeS9zdHlsZXMuY3NzIiwiL1VzZXJzL29tYXIvY29kZS9jb2RleF9wcmVzcy9kZXZlbG9wbWVudC1zZXJ2ZXIvdGVzdC9maXh0dXJlcy9yZXBvc2l0b3J5L2Jhc2UubGVzcyIsIjxpbnB1dCBjc3MgMz4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBO0VBQ0EsYUFBQTtDQUNBOzs7QUNBQTtFQUNFLGFBQUE7Q0NJRCIsImZpbGUiOiJ0by5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyJcbmJvZHkge1xuICBtYXJnaW46IDFyZW07XG59XG5cbiIsIlxuQGltcG9ydCAoaW5saW5lKSAnc3R5bGVzLmNzcyc7XG5cbmJvZHkge1xuICBwYWRkaW5nOiA1cHg7XG59XG5cbiIsIlxuYm9keSB7XG4gIG1hcmdpbjogMXJlbTtcbn1cblxuXG5ib2R5IHtcbiAgcGFkZGluZzogNXB4O1xufVxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYklpOVZjMlZ5Y3k5dmJXRnlMMk52WkdVdlkyOWtaWGhmY0hKbGMzTXZaR1YyWld4dmNHMWxiblF0YzJWeWRtVnlMM1JsYzNRdlptbDRkSFZ5WlhNdmNtVndiM05wZEc5eWVTOXpkSGxzWlhNdVkzTnpJaXdpTDFWelpYSnpMMjl0WVhJdlkyOWtaUzlqYjJSbGVGOXdjbVZ6Y3k5a1pYWmxiRzl3YldWdWRDMXpaWEoyWlhJdmRHVnpkQzltYVhoMGRYSmxjeTl5WlhCdmMybDBiM0o1TDJKaGMyVXViR1Z6Y3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVTkdRVHRGUVVORkxGbEJRVUVpTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKY2JtSnZaSGtnZTF4dUlDQnRZWEpuYVc0NklERnlaVzA3WEc1OVhHNWNiaUlzSWx4dVFHbHRjRzl5ZENBb2FXNXNhVzVsS1NBbmMzUjViR1Z6TG1OemN5YzdYRzVjYm1KdlpIa2dlMXh1SUNCd1lXUmthVzVuT2lBMWNIZzdYRzU5WEc1Y2JpSmRmUT09ICovIl19 */'

  expect(code).toBe(expected)

  const expectedFile = {
    filename: 'base.less',
    path: '/test/base.css',
    deps: [ 'styles.css' ]
  }

  expect(repo.files[1]).toEqual(expectedFile);
})


test('returns error for bad LESS', async () => {
  expect.assertions(2)

  const repo = await makeRepository('repository')

  const msg = new Promise(resolve => repo.on('message', m => resolve(m)))

  try {
    await repo.code('/test/less-error.css')
  }
  catch (error) {

    const expected =  {
      filename: 'less-error.less',
      type: 'CSS',
      message: 'Unrecognised input. Possibly missing something',
      line: 6,
      column: 11,
      extract: "\n\n"
    }

    expect(error).toEqual(expected)

    const expectedMessage = {
      event: 'error',
      repositoryName: 'test',
      filename: 'less-error.less',
      paths: [ '/test/less-error.css' ],
      error: expected,
    }

    expect(await msg).toEqual(expectedMessage);
  }


})


