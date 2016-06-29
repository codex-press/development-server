# Development Server

View your [Codex Press](://codex.press/) stories with assets served from localhost.

Install:
```
  git clone git@github.com:codex-press/development-server.git
  cd development-server
  openssl req -x509 -newkey rsa:2048 -nodes -keyout ssl/key.pem -out ssl/cert.pem -days 3650
  npm install
```

You will need to add the resulting certificate in `ssl/cert.pem` as a trusted root certificate in your operating system or browser. On OS X this is done with the Keychain application. On Linux, it varies by distribution. On Firefox on Linux it needs to be added apart from the operating system. On Chrome OS it's in advanced settings > HTTPS/SSL > Authorities.

Your best bet is to use Google to search for the appropriate method for your rig. You'll know you've suceeded when you can load [https://localhost:8000/repos.json](https://localhost:8000/repos.json) without any scary security warnings (the server must be running or you'll get a warning that you can't connect).

Then link directory repos to your repositories:
```
  ln -s ../pigeon repos/pigeon
```

Start:

```
  npm start
```

