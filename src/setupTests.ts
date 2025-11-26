

// Asegurar localStorage básico si no existe (muchos tests crean su propio stub
// pero dejamos un respaldo para evitar errores en entornos inesperados).
if (typeof (globalThis as any).localStorage === 'undefined') {
  let store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  } as any;
}

// Mapear window.dispatchEvent a globalThis.dispatchEvent para compatibilidad
if (typeof (globalThis as any).dispatchEvent === 'undefined' && typeof (globalThis as any).window !== 'undefined') {
  (globalThis as any).dispatchEvent = (globalThis as any).window.dispatchEvent.bind((globalThis as any).window);
}
// Instalar mock de API (mini-OpenAPI) para tests: respuestas predecibles
try {
  // importa de forma condicional para no romper entornos donde no existe el módulo
  // (este archivo existe en este repo y provee respuestas example para los endpoints).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { installApiMock } = require('./test-utils/apiMock');
  if (typeof installApiMock === 'function') {
    installApiMock();
  }
} catch (e) {
  // ignore si no se puede instalar el mock
}

export {};
