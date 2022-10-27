const ws = require('nodejs-websocket');

const store = {};

const server = ws
  .createServer((conn) => {
    const { path } = conn;
    store[path] = { timer: null, count: 0 };

    const current = store[path];

    conn.on('text', function (data) {
      console.log('server[path]', path);
      console.log('server[text]', data);

      if (current.timer) {
        clearInterval(current.timer);
      }

      current.timer = setInterval(() => {
        current.count += 1;
        let data = Math.random() > 0.5 ? { type: 1, message: '成功' } : { type: 3, message: '失败' };

        each((_conn, finish) => {
          if (current.count >= 10) {
            _conn.sendText(JSON.stringify(data));

            if (finish) close();
            return;
          }
          _conn.sendText(current.count.toString());
        });
      }, 1000);
    });

    conn.on('close', function (code, reason) {
      console.log('server[close] => code', code);
      console.log('server[close] => reason', reason);

      close();
    });

    conn.on('error', function (err) {
      console.log('server[error]', err);

      close();
    });

    function close() {
      each((_conn) => {
        _conn.close();
      });

      clearInterval(current.timer);
      delete store.path;
    }

    function each(fn) {
      const conns = server.connections.filter((_conn) => _conn.path === path && _conn.readyState === 1);

      conns.forEach((_conn, index) => {
        const finish = index === conns.length - 1;
        typeof fn === 'function' && fn(_conn, finish);
      });
    }
  })
  .listen(8987);
