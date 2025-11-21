import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../components/Auth/LoginForm';
import { describe, it, expect, beforeEach } from 'vitest';

// mocks para localStorage y usuarios
if (typeof globalThis.localStorage === 'undefined') {
  let store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  } as any;
}

import { saveUser } from '../utils/validation';

describe('LoginForm component', () => {
  beforeEach(() => {
    localStorage.clear();
    // guardar usuario de prueba
    saveUser({ rut: '1-9', nombre: 'Test', fecha_nac: '2000-01-01', correo: 't@t.com', nombre_usu: 'tester', password: 'abc123' } as any);
  });

  it('muestra errores cuando campos vacios', () => {
    const onSuccess = vi.fn();
    const onSwitch = vi.fn();
    render(<LoginForm onSuccess={onSuccess} onSwitchToRegister={onSwitch} />);
    // enviar sin completar
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));
    // Esperamos mensajes de error en DOM
    expect(screen.getByText(/Ingresa tu usuario/i)).toBeTruthy();
  });
});
