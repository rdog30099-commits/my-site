// NEURO//PATH — необязательный сервер на Node.js (без зависимостей, только встроенные модули)
// Запуск: node server.js  → http://localhost:3000
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 3000;
const INDUSTRY = { manufacturing: 80, retail: 75, finance: 65, legal: 60, healthcare: 55, creative: 50, tech: 45, education: 40 };
const AI = { none: 0, basic: -10, advanced: -20, expert: -30 };
const EXP = { junior: 5, middle: 0, senior: -10, expert: -15 };
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };

function risk({ industry, experience, aiUsage }) {
  if (!(industry in INDUSTRY) || !(experience in EXP) || !(aiUsage in AI)) return null;
  const score = Math.max(10, Math.min(95, INDUSTRY[industry] + AI[aiUsage] + EXP[experience]));
  return { score, level: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low' };
}
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };

const server = http.createServer((req, res) => {
  if (req.url === '/api/health') return send(res, 200, { status: 'OK' });
  if (req.url === '/api/analyze' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e5) req.destroy(); });
    req.on('end', () => {
      try { const r = risk(JSON.parse(body)); r ? send(res, 200, r) : send(res, 400, { error: 'Неверные параметры' }); }
      catch { send(res, 400, { error: 'Неверный JSON' }); }
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
  const file = path.join(__dirname, path.normalize(p));
  if (!file.startsWith(__dirname)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, data) => {
    if (e) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': (TYPES[path.extname(file)] || 'text/plain') + '; charset=utf-8' }); res.end(data);
  });
});
server.listen(PORT, () => console.log(`NEURO//PATH: http://localhost:${PORT}`));
