const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const port = process.env.PORT || 4173;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let filePath = path.join(root, urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, ''));

  if (!filePath.startsWith(root)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      if (urlPath === '/admin' || urlPath === '/admin.html') {
        filePath = path.join(root, 'admin.html');
      } else {
        filePath = path.join(root, 'index.html');
      }
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
      res.end(data);
    });
  });
});

server.listen(port, () => {
  console.log(`Local preview: http://127.0.0.1:${port}`);
});
