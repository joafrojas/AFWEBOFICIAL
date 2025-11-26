import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Startup logging and global error display to avoid a silent black screen.
try {
  console.info('[main] starting app...');
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    const msg = '[main] #root element not found';
    console.error(msg);
    document.body.innerHTML = `<pre style="color: white; background: #000; padding:20px;">${msg}</pre>`;
    throw new Error(msg);
  }

  const root = createRoot(rootEl);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  // Show runtime errors in-page so user doesn't see a blank screen
  window.addEventListener('error', (ev) => {
    try {
      console.error('[window.error]', ev.error || ev.message || ev);
      const detail = (ev.error && ev.error.stack) ? ev.error.stack : (ev.message || String(ev));
      document.body.innerHTML = `<div style="color:#fff;background:#000;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;"><pre style=\"white-space:pre-wrap;\">Runtime error:\n${escapeHtml(detail)}</pre></div>`;
    } catch (e) { /* noop */ }
  });

  window.addEventListener('unhandledrejection', (ev) => {
    try {
      console.error('[unhandledrejection]', ev.reason);
      const detail = ev.reason && ev.reason.stack ? ev.reason.stack : String(ev.reason);
      document.body.innerHTML = `<div style="color:#fff;background:#000;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;"><pre style=\"white-space:pre-wrap;\">Unhandled promise rejection:\n${escapeHtml(detail)}</pre></div>`;
    } catch (e) { /* noop */ }
  });

} catch (err: any) {
  console.error('[main] failed to start app', err);
  try {
    document.body.innerHTML = `<pre style="color: white; background: #000; padding:20px;">App failed to start:\n${escapeHtml(err && err.stack ? err.stack : String(err))}</pre>`;
  } catch (e) { /* noop */ }
}

function escapeHtml(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
