import { render, screen, fireEvent } from '@testing-library/react';
import NavBar from '../components/NavBar';
import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
Swagger Mock Summary: auth/user endpoints used to compute nav visibility
  GET /auth/me
  GET /users
Mock global: `src/test-utils/apiMock.ts`.
*/
if (typeof globalThis.localStorage === 'undefined') {
  let store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  } as any;
}

describe('NavBar component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muestra enlace ADMIN si el usuario tiene correo @asfaltofashion.cl', () => {
    const admin = { nombre_usu: 'admin', correo: 'admin@asfaltofashion.cl' };
    localStorage.setItem('currentUser', JSON.stringify(admin));
    render(<NavBar onLogout={() => {}} />);
    expect(screen.getByText(/ADMIN/i)).toBeTruthy();
  });

  it('invoca onLogout cuando se presiona Cerrar Sesión', () => {
    const onLogout = vi.fn();
    render(<NavBar onLogout={onLogout} />);
    const btn = screen.getByRole('button', { name: /Cerrar Sesión/i });
    fireEvent.click(btn);
    expect(onLogout).toHaveBeenCalled();
  });
});
