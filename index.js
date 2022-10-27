const ws = require('nodejs-websocket');
const all = {};

const server = ws
  .createServer((conn) => {
    conn.on('text', function (data) {
      console.log('server[path]', conn.path);
      console.log('server[text]', data);

      if (data > 0.7) {
        conn.close();
      }

      each((_conn) => {
        _conn.sendText((data * data).toString());
      });
    });

    conn.on('connect', function () {
      console.log('server[connect]');
    });

    conn.on('close', function (code, reason) {
      console.log('server[close] => code', code);
      console.log('server[close] => reason', reason);

      each((_conn) => {
        _conn.close();
      });
    });

    conn.on('error', function (err) {
      console.log('server[error]', err);

      each((_conn) => {
        _conn.close();
      });
    });

    function each(fn) {
      server.connections.forEach((_conn) => {
        if (_conn.path === conn.path && _conn.readyState === 1) {
          typeof fn === 'function' && fn(_conn);
        }
      });
    }
  })
  .listen(8987);
