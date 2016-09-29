# Codex Press Development Server

View your [Codex Press](https://codex.press/) stories with assets served from localhost. CSS and Less assets will be injected into the page on changes.

Install:
```
  git clone git@github.com:codex-press/development-server.git
  cd development-server
  npm install
```

Since Codex uses https to serve pages, this development server must also use an encrypted connection because modern browsers will not load so-called mixed content. You'll need to generate an encryption key and a self-signed certificate to it.
```
  openssl req -x509 -newkey rsa:2048 -nodes -keyout ssl/key.pem -out ssl/cert.pem -days 3650
```

Then you will need to add the resulting certificate, in `ssl/cert.pem`, as a trusted root certificate in your operating system or browser. The instructions for how to do this vary and your best bet is to Google a tutorial for your setup. On OS X this is done with the Keychain application. On Linux, it varies by distribution. On Firefox on Linux it needs to be added apart from the operating system. On Chrome OS it's in Advanced Settings > HTTPS/SSL > Authorities.

You'll know you've suceeded when you can load [https://localhost:8000/](https://localhost:8000/) without any scary security warnings (the server must be running or you'll get a warning that you can't connect).

You can add your repositories to the server by symlinking them inside the directory repos/ like this:
```
  cd repos
  ln -s /path/to/your/repo .
```

Start:
```
  npm start
```

Not compatible with Internet Explorer.

