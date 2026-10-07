const net = require('node:net');
const client = net.createConnection({ port: 8124 }, () => {
  onread: {
    // Reuses a 4KiB Buffer for every read from the socket.
    buffer: Buffer.alloc(4 * 1024),
    callback: function(nread, buf) {
      // Received data is available in `buf` from 0 to `nread`.
      console.log(buf.toString('utf8', 0, nread));
    },
  }  // 'connect' listener.
  console.log('connected to server!');
  client.write('world!\r\n');
});

client.on('data', (data) => {
  console.log(data.toString());
//  client.end();
});
client.on('end', () => {
  console.log('disconnected from server');
});
