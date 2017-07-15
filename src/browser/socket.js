
// Small wrapper on web socket API that reconnects automatically
// fires events: CONNECT, DISCONNECT, RECONNECT and MESSAGE
export default class Socket {

  constructor(callback) {
    this.callback = callback;
    this.connect();
  }


  connect() {
    let ws = new WebSocket('ws://' + location.host);
    ws.addEventListener('message', this.onMessage.bind(this));
    ws.addEventListener('close', this.onClose.bind(this));
    ws.addEventListener('open', this.onOpen.bind(this))
  }


  onMessage(e) {
    this.callback({ type: 'MESSAGE', data: JSON.parse(e.data) });
  }


  onClose(error) {
    if (!this.reconnectTimeout)
      this.callback({ type: 'DISCONNECT' });
    this.reconnectTimeout = setTimeout(() => this.connect(), 2000);
  }


  onOpen() {
    if (!this.reconnectTimeout) {
      this.callback({ type: 'CONNECT' });
    }
    else {
      this.callback({ type: 'RECONNECT' });
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

}

