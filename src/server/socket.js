import WebSocket from 'ws';

import * as log from './log';
import config from './config';

let ws;

export default function start(server) {
  ws = new WebSocket.Server({server});

  ws.on('connection', ws => {
    log.magenta(`WebSocket connected: ${ ws._socket.remoteAddress }`);
  });

}

export function broadcast(message) {
  if (!ws) return;
  message = JSON.stringify(message);
  ws.clients.map(client => {
    if (client.readyState === WebSocket.OPEN)
      client.send(message)
  })
}


