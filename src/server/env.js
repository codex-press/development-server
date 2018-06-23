
export var contentOrigin = 'https://usercontent.codex.press';
export var codexHost = 'codex.press';
export var codexOrigin = 'https://' + codexHost;

if (process.env.NODE_ENV === 'development') {
  // codexHost = 'localhost';
  // codexOrigin = 'http://' + codexHost;
}

export const development = process.env.NODE_ENV === 'development'
export const test = process.env.NODE_ENV === 'test'


