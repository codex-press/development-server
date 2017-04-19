import WebSocket from 'ws';
import chalk from 'chalk';

import config from './config';
import { getFileList } from './repository_list';

let ws;

export default function start(server) {
  ws = new WebSocket.Server({server});

  ws.on('connection', function connection(ws) {
    let client = ws._socket.remoteAddress + ':' + ws._socket.remotePort;

    console.log(chalk.magenta(`WebSocket connect: ${ client }`));
    ws.send(JSON.stringify({fileList: getFileList()}));
  });
}

export function broadcast(message) {
  if (!ws) return;
  message = JSON.stringify(message);
  ws.clients.map(client => client.send(message));
}

