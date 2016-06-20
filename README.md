
# Development Server

Serves Codex Press repositories from localhost on port 8000. Watches files and alerts with a WebSocket on port 8080.

Install
```
  git clone git@github.com:codex-press/development-server.git
  cd development-server
  npm install
```

Then link directory repos to your repositories:
```
  ln -s ../toucan repos/toucan
```

Start:

```
  npm start
```


