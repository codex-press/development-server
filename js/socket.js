import { store } from './index.js';
import { addAlert, removeAlert } from './actions';


// XXX move these inside
let reconnectTimeout;
let firstConnection = true;

export default class Socket {

  constructor() {
    // super();
    this.fileList = {};
    this.connect();
  }


  // returns Promise to a loaded fileList
  connect() {
    return new Promise((resolve, reject) => {

      let ws = new WebSocket('ws://' + location.host);

      ws.onclose = err => {

        // never got a single message so alert that it's not available
        if (firstConnection) {
          this.sendAlert({
            head: `Can't connect to WebSocket at ${ location.host }`,
            type: 'error',
            id: 'connect',
          });
          // disabling it will leave the message since just the child
          // frame will be reloaded with server data
          //article.removeState('dev-server');

          // not really used but makes sense
          reject();
        }
        else {

          // first time we got a close, so alert that it was lost
          if (!reconnectTimeout) {
            this.sendAlert({
              head: 'Lost Connection To Development Server',
              id: 'connect',
              type: 'error',
              timeout: false
            });
          }

          // continue trying to reconnect
          reconnectTimeout = setTimeout(this.connect.bind(this), 2000);
        }

      };


      // can't use onopen because we need the data in the first message so 
      // instead must wait for the first message
      let firstMessage = true;
      ws.onmessage = e => {
        let data = JSON.parse(e.data);

        if (data === 'public/main.js')
          location.reload();
        else if (data === 'public/main.css') {
          let el = document.querySelector('#dev-server');
          let link = el.shadowRoot.querySelector('link');
          link.href = `/main.css?${Date.now()}`
        }

        store.dispatch(addAlert({
          body: `Update: ${data}`,
          id: data
        }));

        return;



        this.fileList = data.fileList;
        if (firstMessage) {
          reconnectTimeout = undefined;
          firstConnection = false;
          firstMessage = false;

          if (data.version === version) {
            this.sendAlert({
              body: 'Connected To Development Server',
              id: 'connect',
            });
            resolve();
          }
          else {
            this.sendAlert({
              head: 'Your Development Server Is Out Of Date',
              body: `The current version is v${version} and you are running
                v${data.version || '0.0.0'}. You must update it like this:`,
              pre: 'git pull\nnpm install',
              id: 'connect',
              timeout: false
            });
            reject();
          }
        }

        else if (data.error) {

          let head;
          if (data.error.filename)
            head = `${data.error.type} Error: ${data.error.filename}`;
          else
            head = `${data.error.type} Error`;

          let body = data.error.message;
          if (data.error.line)
            body += `\nline: ${data.error.line}`;
          if (data.error.column)
            body += `\ncolumn: ${data.error.column}`;

          this.sendAlert({
            head,
            body,
            pre: data.error.extract,
            type: 'error',
            id: data.assetPath,
            timeout: false
          });

          console.error(data.error.message, data.error);
        }
        else if (data.assetPath) {

          this.sendAlert({
            body: `Update: ${data.assetPath}`,
            id: data.assetPath
          });
          this.fileList = data.fileList;
          renderer.updateAsset(data.assetPath);
        }
      };

    });
  }


  sendAlert(args) {
    console.log(args);
    // article.send('alert', args);
  }


}



class InfoAlerter {

  constructor() {
    this.listenTo(window, 'message');

    this.alerts = {};
    this.alertTimers = {};
   
    let container = dom.create('<div class=alert-container></div>');

    dom.body().append(container);

    this.dom = dom(container);
  }


  remove() {
    this.stopListening();
    this.dom.remove();
  }


  message(e) {
    if (e.data.event === 'alert')
      this.showAlert(e.data.args);
  }


  showAlert({
    head = '',
    body = '',
    pre = '',
    type = 'info',
    id = Math.random(),
    timeout = 2000
  }) {

    if (!['error','info'].includes(type))
      throw 'Invalid alert type';

    dom(el).on('click', () => removeAlert())

    // replace existing
    if (this.alerts[id])
      this.alerts[id].remove();

    if (this.alertTimers[id])
      clearTimeout(this.alertTimers[id]);

    this.alerts[id] = el;

    this.dom.append(el);

    if (timeout)
      this.alertTimers[id] = setTimeout(() => removeAlert(), timeout)
    else
      clearTimeout(this.alertTimers[id])

    return el;
  }

};


