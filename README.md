
# Development Server

Serves Codex Press repositories from localhost on port 8000. Watches files and alerts with a WebSocket on port 8080.

Install:
```
  git clone git@github.com:codex-press/development-server.git
  cd development-server
  openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 3650
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


