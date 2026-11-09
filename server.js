// Servidor estático mínimo, sin dependencias, para desplegar en Railway.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const PRIVATE = new Set(['server.js', 'package.json', 'package-lock.json']);

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  const filePath = path.normalize(path.join(ROOT, urlPath));
  const rel = path.relative(ROOT, filePath);
  const blocked = rel.startsWith('..') || rel.split(path.sep).some(p => p.startsWith('.')) || PRIVATE.has(rel);

  const send = (file, status = 200) => {
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(500).end('Error'); return; }
      res.writeHead(status, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    });
  };

  if (blocked) { send(path.join(ROOT, 'index.html'), 404); return; }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) send(filePath);
    else send(path.join(ROOT, 'index.html'), 404);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Nexo CRM escuchando en el puerto ${PORT}`);
});
