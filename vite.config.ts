import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/ (documentación de Vite)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy para llamadas a APIs hacia microservicios locales (evita CORS en desarrollo)
      // Mapea los prefijos del frontend a los context-path de cada microservicio.
      '^/users': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/users/, '/usuarios-api/users'),
        // Elimina la cabecera WWW-Authenticate de las respuestas proxy y maneja errores de conexión
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            if (proxyRes && proxyRes.headers) delete proxyRes.headers['www-authenticate'];
          });
          proxy.on('error', (err: any, _req: any, res: any) => {
            // Registra un error conciso y responde con un 502 JSON para que el frontend reciba
            // una respuesta adecuada (evita que múltiples errores inunden la terminal).
            // eslint-disable-next-line no-console
            console.error('[vite proxy] error de conexión al target:', err && (err as any).code ? (err as any).code : err?.message || err);
            try {
              const r: any = res;
              if (r && !r.headersSent) {
                r.writeHead(502, { 'Content-Type': 'application/json' });
                r.end(JSON.stringify({ error: 'Servicio no disponible', code: err && (err as any).code }));
              }
            } catch (e) { /* ignorar */ }
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
          proxy.on('error', (err: any, _req: any, res: any) => {
            // eslint-disable-next-line no-console
            console.error('[vite proxy] target connection error:', err && (err as any).code ? (err as any).code : err?.message || err);
            try {
              const r: any = res;
              if (r && !r.headersSent) {
                r.writeHead(502, { 'Content-Type': 'application/json' });
                r.end(JSON.stringify({ error: 'Service unavailable', code: err && (err as any).code }));
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
          proxy.on('error', (err: any, _req: any, res: any) => {
            // eslint-disable-next-line no-console
            console.error('[vite proxy] target connection error:', err && (err as any).code ? (err as any).code : err?.message || err);
            try {
              const r: any = res;
              if (r && !r.headersSent) {
                r.writeHead(502, { 'Content-Type': 'application/json' });
                r.end(JSON.stringify({ error: 'Service unavailable', code: err && (err as any).code }));
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
          proxy.on('error', (err: any, _req: any, res: any) => {
            // eslint-disable-next-line no-console
            console.error('[vite proxy] target connection error:', err && (err as any).code ? (err as any).code : err?.message || err);
            try {
              const r: any = res;
              if (r && !r.headersSent) {
                r.writeHead(502, { 'Content-Type': 'application/json' });
                r.end(JSON.stringify({ error: 'Service unavailable', code: err && (err as any).code }));
              }
            } catch (e) { /* ignore */ }
          });
        }
      },
    }
  }
})
