
export const contentOrigin = getMeta('content_origin', 'https://usercontent.codex.press');
export const codexOrigin = getMeta('codex_origin', 'https://codex.press');
export const apiOrigin = codexOrigin + '/api';
export const development = getMeta('env', 'production') === 'development'

function getMeta(prop, defaultValue) {
  const el = document.querySelector(`[name="codex:${ prop }"]`);
  return el ? el.content : defaultValue;
}


