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

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(root, '.env.local'));
loadEnvFile(path.join(root, '.env'));

const vite = await createViteServer({
  root,
  server: {
    middlewareMode: true
  },
  appType: 'spa'
});

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', chunk => chunks.push(chunk));

    req.on('end', () => {
      if (!chunks.length) {
        return resolve({});
      }

      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

function makeRes(res) {
  const apiRes = {
    get headersSent() {
      return res.headersSent;
    },

    setHeader(...args) {
      res.setHeader(...args);
      return apiRes;
    },

    status(code) {
      res.statusCode = code;
      return apiRes;
    },

    json(data) {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json');
      }

      res.end(JSON.stringify(data));
      return apiRes;
    },

    send(data) {
      if (typeof data === 'object' && data !== null) {
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/json');
        }

        res.end(JSON.stringify(data));
      } else {
        res.end(data);
      }

      return apiRes;
    },

    end(data) {
      res.end(data);
      return apiRes;
    }
  };

  return apiRes;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(
      req.url || '/',
      `http://${req.headers.host || 'localhost'}`
    );

    if (url.pathname.startsWith('/api/')) {
      const route = url.pathname.slice('/api/'.length).replace(/\/+$/, '');

      if (!route || !/^[a-z0-9-]+$/i.test(route)) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');

        return res.end(
          JSON.stringify({
            error: 'API route not found'
          })
        );
      }

      const file = path.join(root, 'api', '[route].js');

      if (!fs.existsSync(file)) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');

        return res.end(
          JSON.stringify({
            error: 'Dynamic API router not found'
          })
        );
      }

      req.query = {
        ...Object.fromEntries(url.searchParams.entries()),
        route
      };

      req.body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
        req.method || ''
      )
        ? await collectBody(req)
        : {};

      const moduleUrl = pathToFileURL(file);

      moduleUrl.searchParams.set('t', String(Date.now()));

      const mod = await import(moduleUrl.href);

      if (typeof mod.default !== 'function') {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');

        return res.end(
          JSON.stringify({
            error: 'Invalid API handler'
          })
        );
      }

      return await mod.default(req, makeRes(res));
    }

    return vite.middlewares(req, res, () => {
      res.statusCode = 404;
      res.end('Not found');
    });
  } catch (error) {
    console.error(error);

    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
    }

    if (!res.writableEnded) {
      res.end(
        JSON.stringify({
          error:
            error instanceof Error
              ? error.message
              : 'Server error'
        })
      );
    }
  }
});

const port = Number(process.env.PORT || 5173);

server.listen(port, () => {
  console.log(`MedGuide local app: http://localhost:${port}`);
});