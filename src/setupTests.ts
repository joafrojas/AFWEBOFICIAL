

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

export {};
