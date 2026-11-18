import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'node:http';

const SERVER_ENV_KEYS = [
  'GEMINI_API_KEY',
  'GEMINI_MODEL',
  'GEMINI_LIVE_MODEL',
  'LEAD_ENDPOINT',
  'GA_MEASUREMENT_ID',
] as const;

const DEV_API_ROUTES: Record<string, string> = {
  '/api/config': '/api/config.ts',
  '/api/leads': '/api/leads.ts',
  '/api/ai/feynman': '/api/ai/feynman.ts',
  '/api/ai/ocr': '/api/ai/ocr.ts',
  '/api/ai/material': '/api/ai/material.ts',
  '/api/ai/live-token': '/api/ai/live-token.ts',
};

/**
 * Monta las funciones serverless de `/api` directamente en el servidor local de Vite
 * manteniendo las variables sensibles (GEMINI_API_KEY, etc.) exclusivamente en Node.js.
 */
function quackApiDevPlugin(mode: string): Plugin {
  return {
    name: 'quack-api-dev-middleware',
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), '');
      for (const key of SERVER_ENV_KEYS) {
        if (process.env[key] === undefined && env[key] !== undefined) {
          process.env[key] = env[key];
        }
      }

      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || '').split('?')[0];
        const targetModule = DEV_API_ROUTES[pathname];
        if (!targetModule) {
          next();
          return;
        }

        try {
          const mod = (await server.ssrLoadModule(targetModule)) as {
            default?: (
              request: IncomingMessage,
              response: ServerResponse
            ) => void | Promise<void>;
          };

          if (typeof mod.default !== 'function') {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: `Handler inválido para ${pathname}` }));
            return;
          }

          await mod.default(req, res);
        } catch (err) {
          server.ssrFixStacktrace(err as Error);
          console.error(`[vite-api] Error ejecutando ${pathname}:`, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : 'Error interno en API local.',
              })
            );
          }
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), quackApiDevPlugin(mode)],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          katex: ['katex'],
        },
      },
    },
  },
}));
