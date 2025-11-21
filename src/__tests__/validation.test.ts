import { describe, it, expect, beforeEach } from 'vitest';
import { validarCorreo, validarPassword, validarEdad, getUsers, saveUser } from '../utils/validation';

describe('utils de validación', () => {
  
    if (typeof globalThis.localStorage === 'undefined') {
      let store: Record<string, string> = {};
      globalThis.localStorage = {
        getItem: (k: string) => (k in store ? store[k] : null),
        setItem: (k: string, v: string) => { store[k] = String(v); },
        removeItem: (k: string) => { delete store[k]; },
        clear: () => { store = {}; },
      } as any;
    }


    if (typeof (globalThis as any).window === 'undefined') {
      (globalThis as any).window = globalThis as any;
    }
    if (typeof (globalThis as any).window.dispatchEvent !== 'function') {
      (globalThis as any).window.dispatchEvent = (_ev: any) => { return true; };
    }
    if (typeof (globalThis as any).Event === 'undefined') {
      (globalThis as any).Event = (function (this: any, t: any) { this.type = t; }) as any;
    }

    beforeEach(() => {
      // limpiar storage antes de cada test
      try { localStorage.clear(); } catch (e) {}
    });

  it('validarCorreo acepta correos válidos', () => {
    expect(validarCorreo('test@example.com')).toBe(true);
    expect(validarCorreo('usuario.nombre@dominio.cl')).toBe(true);
    expect(validarCorreo('bad-email')).toBe(false);
  });

  it('validarPassword exige mínimo 6 caracteres', () => {
    expect(validarPassword('12345')).toBe(false);
    expect(validarPassword('abc123')).toBe(true);
  });

  it('validarEdad detecta mayor de 18', () => {
    const today = new Date();
    const over18 = new Date(today.getFullYear() - 20, 0, 1).toISOString().split('T')[0];
    const under18 = new Date(today.getFullYear() - 10, 0, 1).toISOString().split('T')[0];
    expect(validarEdad(over18)).toBe(true);
    expect(validarEdad(under18)).toBe(false);
  });

  it('saveUser / getUsers persisten en localStorage', () => {
    // limpiar antes
    localStorage.removeItem('users');
    const user = { rut: '1-9', nombre: 'Test', fecha_nac: '2000-01-01', correo: 't@t.com', nombre_usu: 'tester', password: 'abc123' };
    saveUser(user as any);
    const users = getUsers();
    expect(users.some(u => u.nombre_usu === 'tester')).toBe(true);
  });
});
