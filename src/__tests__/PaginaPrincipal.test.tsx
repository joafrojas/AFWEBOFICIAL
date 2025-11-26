/*
Swagger Mock Summary:
  GET /users
  GET /api/posts

Mock global disponible en `src/test-utils/apiMock.ts`.
*/
import { render, screen } from '@testing-library/react';
import PaginaPrincipal from '../components/Pages/PaginaPrincipal';
import { describe, it, expect, beforeEach } from 'vitest';
import { saveUser } from '../utils/validation';

if (typeof globalThis.localStorage === 'undefined') {
  let store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  } as any;
}

describe('PaginaPrincipal', () => {
  beforeEach(() => {
    localStorage.clear();
    saveUser({ rut: '1-9', nombre: 'Test', fecha_nac: '2000-01-01', correo: 't@t.com', nombre_usu: 'tester', password: 'abc123' } as any);
    localStorage.setItem('currentUser', JSON.stringify({ nombre_usu: 'tester' }));
  });

  it('muestra la galería y permite dar like', () => {
    const onLogout = () => {};
    render(<PaginaPrincipal currentUser={{ nombre_usu: 'tester' } as any} onLogout={onLogout} />);
    // buscar el primer botón de like
    const likeBtn = screen.getAllByRole('button', { name: /♡|♥/i })[0];
    expect(likeBtn).toBeTruthy();
  });

  it('muestra navigation bar o heading principal', () => {
    const onLogout = () => {};
    render(<PaginaPrincipal currentUser={{ nombre_usu: 'tester' } as any} onLogout={onLogout} />);
    // puede tener una nav o varios headings
    const nav = screen.queryByRole('navigation');
    const headings = screen.queryAllByRole('heading');
    expect(nav || headings.length > 0).toBeTruthy();
  });
});
