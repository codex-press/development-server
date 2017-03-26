import WebSocket from 'ws';

let ws;

export default function start(server) {

  ws = new WebSocket.Server({server});

  ws.on('connection', function connection(ws) {
    let sock = ws._socket;
    console.log(`WS connect ${sock.remoteAddress}:${sock.remotePort}`); 
    // ws.send(JSON.stringify({version, fileList}));
  });

}

export function broadcast(message) {
  message = JSON.stringify(message);
  ws.clients.map(client => client.send(message));
}

