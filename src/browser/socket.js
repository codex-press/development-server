

// Small wrapper on web socket API that returns a Promise to the nextEvent()
// for use in redux-sagas.

export default class Socket {


  constructor() {
    this._promise = new Promise(resolve => this._resolve = resolve);
  }


  nextEvent() {
    return this._promise;
  }


  event(e) {
    this._resolve(e);
    this._promise = new Promise(resolve => this._resolve = resolve);
  }


  connect() {
    let resolved = false;

    let ws = new WebSocket('ws://' + location.host);

    ws.addEventListener('message', this.onMessage.bind(this));
    ws.addEventListener('close', this.onClose.bind(this));
    ws.addEventListener('open', this.onOpen.bind(this))
  }


  onClose(error) {
    if (!this.reconnectTimeout)
      this.event({type: 'DISCONNECT'});
    this.reconnectTimeout = setTimeout(this.connect.bind(this), 2000);
  }


  onOpen() {
    this.event({type: 'CONNECT'});
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }


  onMessage(e) {
    let data = JSON.parse(e.data);
    this.event({type: 'MESSAGE', data});
  }


}

