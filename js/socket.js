import { store } from './index.js';
import { addAlert, removeAlert } from './actions';

// XXX move these inside
let reconnectTimeout;

export default class Socket {

  constructor() {
    this.fileList = {};
    this.firstConnection = true;
  }


  // returns Promise to a loaded fileList
  connect() {
    let resolved = false;
    return new Promise((resolve, reject) => {

      let ws = new WebSocket('ws://' + location.host);

      ws.addEventListener('close', this.onClose.bind(this));
      ws.addEventListener('message', this.onMessage.bind(this));

      const firstMessage = e => {
        let data = JSON.parse(e.data);
        resolve(data.fileList);
        ws.removeEventListener('message', firstMessage);
      };

      ws.addEventListener('message', firstMessage);
    });

  }


  sendAlert(args) {
    console.log(args);
    // article.send('alert', args);
  }


  onClose(error) {
    console.log('socket close', error);

    // first time we got a close, so alert that it was lost
    // if (!this.reconnectTimeout) {
    //   this.sendAlert({
    //     head: 'Lost Connection To Development Server',
    //     id: 'connect',
    //     type: 'error',
    //     timeout: false
    //   });
    // }

    // continue trying to reconnect
    this.reconnectTimeout = setTimeout(this.connect.bind(this), 2000);
  }


  onMessage(e) {
    let data = JSON.parse(e.data);
    // console.log('ws message', data);

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
      this.firstConnection = false;
      firstMessage = false;

      if (data.version === version) {
        this.sendAlert({
          body: 'Connected To Development Server',
          id: 'connect',
        });
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


