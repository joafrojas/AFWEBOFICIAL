/*
Swagger Mock Summary (admin flows):
  GET /users -> lista de usuarios
  GET /auth/me -> perfil desde token
  GET /api/posts -> lista de publicaciones
  GET /contacto/listar -> lista de contactos

El mock global está en `src/test-utils/apiMock.ts`.
*/
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaginaAdmin from '../components/Pages/PaginaAdmin';
import { describe, it, expect, vi } from 'vitest';

describe('PaginaAdmin', () => {
  it('renders and shows admin heading and buttons when user is admin', () => {
    // Forzar usuario admin en localStorage para que el panel muestre los botones
    localStorage.setItem('currentUser', JSON.stringify({ nombre_usu: 'admin', correo: 'admin@asfaltofashion.cl', isAdmin: true }));
    render(<PaginaAdmin />);
    expect(screen.getByText(/Panel Administrativo/i)).toBeTruthy();
    // Debe mostrar al menos el botón para cargar usuarios
    const loadUsersBtn = screen.getByRole('button', { name: /Cargar usuarios/i });
    expect(loadUsersBtn).toBeTruthy();
  });

  it('llama GET /users al presionar Cargar usuarios', async () => {
    localStorage.setItem('currentUser', JSON.stringify({ nombre_usu: 'admin', correo: 'admin@asfaltofashion.cl', isAdmin: true }));
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<PaginaAdmin />);
    const loadUsersBtn = screen.getByRole('button', { name: /Cargar usuarios/i });
    fireEvent.click(loadUsersBtn);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    const calledUsers = fetchSpy.mock.calls.some((c: any) => typeof c[0] === 'string' && c[0].includes('/users'));
    expect(calledUsers).toBe(true);
    fetchSpy.mockRestore();
  });
});
