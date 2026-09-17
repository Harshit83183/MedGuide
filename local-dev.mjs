import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer as createViteServer } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvFile(path.join(root, '.env.local'));
loadEnvFile(path.join(root, '.env'));

const vite = await createViteServer({ root, server: { middlewareMode: true }, appType: 'spa' });

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function makeRes(res) {
  const apiRes = {
    setHeader: (...args) => { res.setHeader(...args); return apiRes; },
    status: (code) => { res.statusCode = code; return apiRes; },
    json: (data) => { if (!res.headersSent) res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); return apiRes; },
    end: (data) => { res.end(data); return apiRes; },
  };
  return apiRes;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      const name = url.pathname.slice('/api/'.length);
      if (!/^[a-z0-9-]+$/i.test(name)) { res.statusCode = 404; return res.end('Not found'); }
      const file = path.join(root, 'api', name + '.js');
      if (!fs.existsSync(file)) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'API route not found' })); }
      req.query = Object.fromEntries(url.searchParams.entries());
      req.body = ['POST','PUT','PATCH'].includes(req.method || '') ? await collectBody(req) : {};
      const moduleUrl = pathToFileURL(file);
      moduleUrl.searchParams.set('t', String(Date.now()));
      const mod = await import(moduleUrl.href);
      return await mod.default(req, makeRes(res));
    }
    return vite.middlewares(req, res, () => { res.statusCode = 404; res.end('Not found'); });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.statusCode = 500;
    res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Server error' }));
  }
});

const port = Number(process.env.PORT || 5173);
server.listen(port, () => console.log(`MedGuide local app: http://localhost:${port}`));
