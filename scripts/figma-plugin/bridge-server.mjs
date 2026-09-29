import http from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_PORT = 3845;
export const MAX_BODY_BYTES = 64 * 1024 * 1024;
export const ALLOWED_JSON_ROOT = 'design/operations';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');

export function resolveRepoJsonPath(inputPath, repoRoot = DEFAULT_REPO_ROOT) {
  if (typeof inputPath !== 'string' || !inputPath.trim()) {
    throw new Error('path is required');
  }

  const normalized = inputPath.trim().replace(/\\/g, '/');
  if (normalized.includes('\0') || path.posix.isAbsolute(normalized)) {
    throw new Error('absolute or invalid path is not allowed');
  }

  const clean = path.posix.normalize(normalized);
  if (
    clean === '..' ||
    clean.startsWith('../') ||
    !clean.startsWith(ALLOWED_JSON_ROOT + '/') ||
    !clean.toLowerCase().endsWith('.json')
  ) {
    throw new Error(`only ${ALLOWED_JSON_ROOT}/**/*.json is allowed`);
  }

  const allowedRoot = path.resolve(repoRoot, ALLOWED_JSON_ROOT);
  const resolved = path.resolve(repoRoot, clean);
  const prefix = allowedRoot.endsWith(path.sep) ? allowedRoot : allowedRoot + path.sep;

  if (!resolved.startsWith(prefix)) {
    throw new Error('path escapes allowed repository root');
  }

  return { relativePath: clean, absolutePath: resolved };
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'cache-control': 'no-store',
  });
  res.end(body);
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error('request body too large');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) throw new Error('JSON body is required');

  try {
    return JSON.parse(raw);
  } catch (error) {
    const parseError = new Error('invalid JSON body: ' + error.message);
    parseError.statusCode = 400;
    throw parseError;
  }
}

export function createBridgeServer({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  return http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,OPTIONS',
        'access-control-allow-headers': 'content-type',
      });
      return res.end();
    }

    let url;
    try {
      url = new URL(req.url || '/', 'http://localhost');
    } catch {
      return sendJson(res, 400, { ok: false, error: 'invalid URL' });
    }

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        return sendJson(res, 200, {
          ok: true,
          service: 'design-flow-harness-figma-bridge',
          repoRoot,
          allowedRoot: ALLOWED_JSON_ROOT,
        });
      }

      if (req.method === 'GET' && url.pathname === '/api/spec') {
        const requested = url.searchParams.get('path');
        const target = resolveRepoJsonPath(requested, repoRoot);
        const raw = await readFile(target.absolutePath, 'utf8');
        const spec = JSON.parse(raw);
        return sendJson(res, 200, {
          ok: true,
          path: target.relativePath,
          spec,
        });
      }

      if (req.method === 'POST' && url.pathname === '/api/result') {
        const body = await readJsonBody(req);
        const target = resolveRepoJsonPath(body.path, repoRoot);
        if (!Object.prototype.hasOwnProperty.call(body, 'data')) {
          return sendJson(res, 400, { ok: false, error: 'data is required' });
        }

        await mkdir(path.dirname(target.absolutePath), { recursive: true });
        const serialized = JSON.stringify(body.data, null, 2) + '\n';
        await writeFile(target.absolutePath, serialized, 'utf8');

        return sendJson(res, 200, {
          ok: true,
          path: target.relativePath,
          bytes: Buffer.byteLength(serialized),
        });
      }

      return sendJson(res, 404, { ok: false, error: 'not found' });
    } catch (error) {
      const code =
        typeof error.statusCode === 'number'
          ? error.statusCode
          : error.code === 'ENOENT'
          ? 404
          : error instanceof SyntaxError
          ? 400
          : 400;
      return sendJson(res, code, { ok: false, error: error.message });
    }
  });
}

export function startBridgeServer({
  host = process.env.FIGMA_BRIDGE_HOST || DEFAULT_HOST,
  port = Number(process.env.FIGMA_BRIDGE_PORT || DEFAULT_PORT),
  repoRoot = process.env.FIGMA_BRIDGE_REPO_ROOT
    ? path.resolve(process.env.FIGMA_BRIDGE_REPO_ROOT)
    : DEFAULT_REPO_ROOT,
} = {}) {
  const server = createBridgeServer({ repoRoot });
  server.listen(port, host, () => {
    console.log(`Design Flow Harness bridge: http://${host}:${port}`);
    console.log(`Repo root: ${repoRoot}`);
    console.log(`Allowed JSON root: ${ALLOWED_JSON_ROOT}/`);
  });
  return server;
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  startBridgeServer();
}
