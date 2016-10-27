# Codex Press Development Server

View your [Codex Press](https://codex.press/) stories with assets served from localhost. CSS, Less, SVG and templates will be injected into the page on changes. Javascript will reload the frame.

Install:
```
  git clone git@github.com:codex-press/development-server.git
  cd development-server
  npm install
```

Since Codex uses the encrypted https to serve pages, this development server must also use an encrypted connection because modern browsers will not load so-called mixed content. You'll need to generate an encryption key and a self-signed certificate to it.

On MacOS or Linux you can use the following command:
```
  openssl req -x509 -newkey rsa:2048 -nodes -keyout ssl/key.pem -out ssl/cert.pem -days 3650
```
On Windows, it's probably easiest to use an [online tool](http://www.selfsignedcertificate.com/). Save the files inside the ssl repo as `key.pem` and `cert.pem`.

You will also need to add the certificate, `ssl/cert.pem`, as a trusted root certificate in your operating system or browser. The instructions for how to do this vary and your best bet is to search the web for a tutorial specific to your setup. On OS X, this is done with the Keychain application. On Linux, it varies by distribution. On Firefox, it needs to be added apart from the operating system. On Chrome OS, it's in Advanced Settings > HTTPS/SSL > Authorities.

You'll know you've suceeded when you can load [https://localhost:8000/](https://localhost:8000/) without any scary security warnings (the server must be running or you'll get a warning that you can't connect).

You can add your repositories to the server by symlinking them inside the directory repos/. On MacOS or Linux:
```
  cd repos
  ln -s /path/to/your/repo .
```
On Windows:
```
  cd repos
  mklink /D c:\path\to\your\repo repo_name
```

Start on Mac or Linux:
```
  ./start.sh
```

Start on Windows:
```
  ./start.sh
```

Not compatible with Internet Explorer.

