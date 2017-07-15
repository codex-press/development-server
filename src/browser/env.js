
export const contentOrigin = getMeta('content_origin', 'https://usercontent.codex.press');
export const codexOrigin = getMeta('codex_origin', 'https://codex.press');
export const apiOrigin = getMeta('api_origin', 'https://api.codex.press');
export const development = getMeta('env', 'production') === 'development'

function getMeta(prop, defaultValue) {
  const el = document.querySelector(`[name="codex:${ prop }"]`);
  return el ? el.content : defaultValue;
}


