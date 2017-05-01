import { store } from './index.js';
import { addAlert, removeAlert } from './actions';

export default class Socket {

  constructor(callback) {
    this.callback = callback;
    this.fileList = {};
  }


  // returns Promise to a loaded fileList
  connect() {
    let resolved = false;
    return new Promise((resolve, reject) => {

      let ws = new WebSocket('ws://' + location.host);

      ws.addEventListener('close', this.onClose.bind(this));
      ws.addEventListener('message', this.onMessage.bind(this));
      ws.addEventListener('open', this.onOpen.bind(this))

      const firstMessage = e => {
        let data = JSON.parse(e.data);
        this.callback(data.fileList);
        resolve(data.fileList);
        ws.removeEventListener('message', firstMessage);
      };

      ws.addEventListener('message', firstMessage);
    });

  }


  onClose(error) {
    // console.log('socket close', error);

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


  onOpen() {
    clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = null;
  }


  onMessage(e) {
    let data = JSON.parse(e.data);
    // console.log('ws message', data);

    if (data.publicUpdate) {
      if (data.publicUpdate === 'public/main.js')
        location.reload();
      else if (data.publicUpdate === 'public/main.css') {
        let el = document.querySelector('#dev-server');
        let link = el.shadowRoot.querySelector('link');
        link.href = `/main.css?${Date.now()}`
      }
    }

    return;

    // Use a callback for this. actual alerts created elsewhere
    store.dispatch(addAlert({
      body: `Update: ${assetPath}`,
      id: data
    }));

    if (data.fileList)
      this.callback(data.fileList);




    return;

    this.fileList = data.fileList;

    if (data.error) {

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


