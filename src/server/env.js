
export var contentOrigin = 'https://usercontent.staging.codex.press';
export var codexHost = 'staging.codex.press';
export var codexOrigin = 'https://' + codexHost;

if (process.env.NODE_ENV === 'development') {
  contentOrigin = 'http://localhost';
  codexHost = 'localhost';
  codexOrigin = 'http://' + codexHost;
}
