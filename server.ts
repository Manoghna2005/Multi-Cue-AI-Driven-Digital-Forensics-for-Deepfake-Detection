import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';
import path from 'path';
import http from 'http';

const app = express();
const PORT = 3000;
const PYTHON_PORT = 5000;

// Function to check if Python FastAPI is already listening on port 5000
function checkPythonServer(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${PYTHON_PORT}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Ensure Python FastAPI is running
async function ensurePythonBackend() {
  const isRunning = await checkPythonServer();
  if (isRunning) {
    console.log(`[Backend] FastAPI is already active on http://127.0.0.1:${PYTHON_PORT}`);
    return;
  }

  console.log(`[Backend] Spawning FastAPI process on port ${PYTHON_PORT}...`);
  const pythonProc = spawn(
    'python3',
    ['-m', 'uvicorn', 'main:app', '--app-dir', 'backend', '--host', '127.0.0.1', '--port', `${PYTHON_PORT}`],
    {
      cwd: process.cwd(),
      stdio: 'inherit',
      detached: false,
    }
  );

  pythonProc.on('error', (err) => {
    console.error('[Backend] Failed to start Python process:', err);
  });

  // Give it a moment to bind
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 600));
    if (await checkPythonServer()) {
      console.log(`[Backend] FastAPI successfully bound to http://127.0.0.1:${PYTHON_PORT}`);
      break;
    }
  }
}

async function startServer() {
  await ensurePythonBackend();

  // Proxy /api requests to FastAPI backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://127.0.0.1:${PYTHON_PORT}`,
      changeOrigin: true,
    })
  );

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Deepfake Detection App running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
});
