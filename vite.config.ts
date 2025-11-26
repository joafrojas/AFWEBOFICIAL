import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls to local microservices to avoid CORS in development
      // Map frontend prefixes to the microservices' context paths.
      '^/users': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/users/, '/usuarios-api/users'),
        // Remove WWW-Authenticate header from proxied responses and handle connection errors
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            if (proxyRes && proxyRes.headers) delete proxyRes.headers['www-authenticate'];
          });
          proxy.on('error', (err, req, res) => {
            // Log concise error and send a 502 JSON so frontend receives a proper response
            // (prevents Node aggregate errors flooding the terminal)
            // eslint-disable-next-line no-console
            console.error('[vite proxy] target connection error:', err && err.code ? err.code : err?.message || err);
            try {
              if (res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Service unavailable', code: err && err.code }));
              }
            } catch (e) { /* ignore */ }
          });
        }
      },
      '^/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth/, '/usuarios-api/auth'),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            if (proxyRes && proxyRes.headers) delete proxyRes.headers['www-authenticate'];
          });
          proxy.on('error', (err, req, res) => {
            // eslint-disable-next-line no-console
            console.error('[vite proxy] target connection error:', err && err.code ? err.code : err?.message || err);
            try {
              if (res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Service unavailable', code: err && err.code }));
              }
            } catch (e) { /* ignore */ }
          });
        }
      },
      '^/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/foro-api/api'),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            if (proxyRes && proxyRes.headers) delete proxyRes.headers['www-authenticate'];
          });
          proxy.on('error', (err, req, res) => {
            // eslint-disable-next-line no-console
            console.error('[vite proxy] target connection error:', err && err.code ? err.code : err?.message || err);
            try {
              if (res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Service unavailable', code: err && err.code }));
              }
            } catch (e) { /* ignore */ }
          });
        }
      },
      '^/contacto': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/contacto/, '/contacto-api/contacto'),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            if (proxyRes && proxyRes.headers) delete proxyRes.headers['www-authenticate'];
          });
          proxy.on('error', (err, req, res) => {
            // eslint-disable-next-line no-console
            console.error('[vite proxy] target connection error:', err && err.code ? err.code : err?.message || err);
            try {
              if (res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Service unavailable', code: err && err.code }));
              }
            } catch (e) { /* ignore */ }
          });
        }
      },
    }
  }
})
